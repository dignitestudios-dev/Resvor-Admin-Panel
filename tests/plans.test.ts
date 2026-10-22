import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDisplayPrice,
  validateLabel,
  validateSubscriptionFeatures,
  validateVenueDescription,
  computeSubscriptionDelta,
  computeVenueDelta,
  calculatePriceChange,
  parseApiValidationErrors,
  filterPlans,
} from '../lib/plan-utils.ts';
import type {
  SubscriptionPlan,
  VenueMembershipPlan,
  Plan,
  PriceMigrationSummary,
} from '../types/plan.ts';

const mockSubscriptionPlan: SubscriptionPlan = {
  _id: '507f1f77bcf86cd799439011',
  key: 'gold',
  label: 'Gold',
  displayPrice: 15.99,
  currency: 'usd',
  durationDays: 30,
  features: [
    'Up to 50 recipients per campaign',
    'Unlimited campaigns',
    'Delivery by email',
  ],
  allowedRoles: ['user'],
  interfaces: ['user'],
  trialDays: 0,
  limitations: {
    campaignsPerBillingPeriod: null,
    recipientsPerCampaign: 50,
    campaignChannels: ['email'],
  },
  isActive: true,
  sortOrder: 3,
  planType: 'subscription',
};

const mockVenueMembershipPlan: VenueMembershipPlan = {
  _id: '507f1f77bcf86cd799439012',
  key: 'vip',
  label: 'VIP Membership',
  description: 'VIP benefits at participating Resvor venues.',
  displayPrice: 100,
  currency: 'usd',
  billingInterval: 'month',
  isPriceProvisional: false,
  interfaces: ['user', 'lounge_manager'],
  isActive: true,
  sortOrder: 0,
  planType: 'venue_membership',
};

const mockPlans: Plan[] = [
  mockSubscriptionPlan,
  mockVenueMembershipPlan,
  {
    _id: '507f1f77bcf86cd799439013',
    key: 'silver',
    label: 'Silver',
    displayPrice: 9.99,
    currency: 'usd',
    durationDays: 30,
    features: ['Up to 20 recipients per campaign'],
    allowedRoles: ['user'],
    interfaces: ['user'],
    isActive: false,
    sortOrder: 1,
    planType: 'subscription',
  },
  {
    _id: '507f1f77bcf86cd799439014',
    key: 'partner',
    label: 'Partner Lounge Access',
    description: 'Exclusive lounge manager promotional network access.',
    displayPrice: 250,
    currency: 'usd',
    billingInterval: 'year',
    interfaces: ['lounge_manager'],
    isActive: true,
    sortOrder: 2,
    planType: 'venue_membership',
  },
];

describe('Plan Validation Rules', () => {
  it('validates displayPrice must be greater than zero and at most 2 decimal places', () => {
    assert.equal(validateDisplayPrice(15.99), null);
    assert.equal(validateDisplayPrice(100), null);
    assert.equal(validateDisplayPrice(0.01), null);
    assert.equal(validateDisplayPrice('18.50'), null);

    // Invalid values
    assert.match(validateDisplayPrice(0)!, /greater than zero/);
    assert.match(validateDisplayPrice(-10)!, /greater than zero/);
    assert.match(validateDisplayPrice('invalid')!, /valid number/);
    assert.match(validateDisplayPrice('')!, /required/);
    assert.match(validateDisplayPrice(15.999)!, /at most two decimal places/);
  });

  it('validates label is required and cannot be empty', () => {
    assert.equal(validateLabel('Gold Plus'), null);
    assert.equal(validateLabel('VIP'), null);

    assert.match(validateLabel('')!, /required/);
    assert.match(validateLabel('   ')!, /required/);
    assert.match(validateLabel(null)!, /required/);
  });

  it('validates subscription features between 1 and 25 non-empty strings', () => {
    assert.equal(validateSubscriptionFeatures(['Feature 1', 'Feature 2']), null);
    assert.equal(validateSubscriptionFeatures(Array(25).fill('Valid Feature')), null);

    // Invalid
    assert.match(validateSubscriptionFeatures([])!, /at least 1 feature/);
    assert.match(validateSubscriptionFeatures([''])!, /must be non-empty/);
    assert.match(validateSubscriptionFeatures(['Valid', '   '])!, /must be non-empty/);
    assert.match(validateSubscriptionFeatures(Array(26).fill('Feature'))!, /more than 25 features/);
  });

  it('validates venue membership description cannot be empty', () => {
    assert.equal(validateVenueDescription('Valid description of benefits.'), null);

    assert.match(validateVenueDescription('')!, /required/);
    assert.match(validateVenueDescription('   ')!, /required/);
    assert.match(validateVenueDescription(null)!, /required/);
  });
});

describe('Delta Calculation & Protected Fields Protection', () => {
  it('detects content-only updates for subscription without sending protected fields', () => {
    const delta = computeSubscriptionDelta(mockSubscriptionPlan, {
      label: 'Gold Plus',
      features: ['Up to 100 recipients', 'Unlimited campaigns'],
      displayPrice: 15.99, // Unchanged
    });

    assert.ok(delta);
    assert.equal(delta.label, 'Gold Plus');
    assert.deepEqual(delta.features, ['Up to 100 recipients', 'Unlimited campaigns']);
    assert.equal(delta.displayPrice, undefined);

    // Assert protected fields are NEVER present
    const protectedKeys = [
      '_id',
      'key',
      'isActive',
      'allowedRoles',
      'limitations',
      'currency',
      'billingInterval',
      'trialDays',
      'durationDays',
      'sortOrder',
      'planType',
    ];
    for (const key of protectedKeys) {
      assert.equal((delta as Record<string, unknown>)[key], undefined);
    }
  });

  it('detects venue membership updates with description and displayPrice change', () => {
    const delta = computeVenueDelta(mockVenueMembershipPlan, {
      label: 'VIP Membership', // Unchanged
      description: 'Premium benefits at participating Resvor venues.',
      displayPrice: 125, // Changed
    });

    assert.ok(delta);
    assert.equal(delta.label, undefined);
    assert.equal(delta.description, 'Premium benefits at participating Resvor venues.');
    assert.equal(delta.displayPrice, 125);

    // Assert protected fields are NEVER present
    assert.equal((delta as Record<string, unknown>).key, undefined);
    assert.equal((delta as Record<string, unknown>).billingInterval, undefined);
  });

  it('returns null when no fields changed', () => {
    const subDelta = computeSubscriptionDelta(mockSubscriptionPlan, {
      label: 'Gold',
      features: [...mockSubscriptionPlan.features],
      displayPrice: 15.99,
    });
    assert.equal(subDelta, null);

    const venueDelta = computeVenueDelta(mockVenueMembershipPlan, {
      label: 'VIP Membership',
      description: mockVenueMembershipPlan.description,
      displayPrice: 100,
    });
    assert.equal(venueDelta, null);
  });

  it('detects feature reordering as a change', () => {
    const reversedFeatures = [...mockSubscriptionPlan.features].reverse();
    const delta = computeSubscriptionDelta(mockSubscriptionPlan, {
      label: 'Gold',
      features: reversedFeatures,
      displayPrice: 15.99,
    });

    assert.ok(delta);
    assert.deepEqual(delta.features, reversedFeatures);
  });
});

describe('Price Confirmation & Difference Calculation', () => {
  it('correctly calculates price increase and formatted difference', () => {
    const change = calculatePriceChange(15.99, 18.99, 'usd');

    assert.equal(change.oldPrice, 15.99);
    assert.equal(change.newPrice, 18.99);
    assert.equal(change.diff, 3.0);
    assert.equal(change.isIncrease, true);
    assert.equal(change.isDecrease, false);
    assert.match(change.formattedDiff, /\+USD 3\.00/);
    assert.match(change.formattedDiff, /\+18\.8%/);
  });

  it('correctly calculates price decrease and formatted difference', () => {
    const change = calculatePriceChange(100, 80, 'usd');

    assert.equal(change.diff, -20.0);
    assert.equal(change.isIncrease, false);
    assert.equal(change.isDecrease, true);
    assert.match(change.formattedDiff, /-USD 20\.00/);
    assert.match(change.formattedDiff, /-20\.0%/);
  });
});

describe('API Error Handling and Field-level Validation', () => {
  it('parses field-level validation errors from backend response', () => {
    const mockApiError = {
      response: {
        status: 400,
        data: {
          success: false,
          message: 'Validation failed',
          error: [
            { path: 'body.displayPrice', message: 'Price must be greater than zero.' },
            { path: 'body.label', message: 'Label cannot be empty.' },
            { path: 'body.features[0]', message: 'Feature item cannot be empty.' },
          ],
        },
      },
    };

    const parsed = parseApiValidationErrors(mockApiError);

    assert.equal(parsed.isHttp503, false);
    assert.equal(parsed.generalMessage, 'Validation failed');
    assert.equal(parsed.fieldErrors.displayPrice, 'Price must be greater than zero.');
    assert.equal(parsed.fieldErrors.label, 'Label cannot be empty.');
    assert.equal(parsed.fieldErrors.features, 'Feature item cannot be empty.');
  });

  it('handles HTTP 503 partial migration retry state', () => {
    const mock503Error = {
      response: {
        status: 503,
        data: {
          success: false,
          message: 'Some subscriptions could not be migrated. Please retry the same update.',
        },
      },
    };

    const parsed = parseApiValidationErrors(mock503Error);

    assert.equal(parsed.isHttp503, true);
    assert.match(parsed.generalMessage, /Some subscriptions could not be migrated/);
  });
});

describe('Price Migration Summary & Archiving', () => {
  it('validates migration summary structure and flags archive notice when oldPriceArchived is false', () => {
    const summaryWithArchiveNotice: PriceMigrationSummary = {
      matched: 12,
      migrated: 10,
      alreadyMigrated: 1,
      noLongerBillable: 1,
      failed: 0,
      oldPriceArchived: false,
    };

    assert.equal(summaryWithArchiveNotice.matched, 12);
    assert.equal(summaryWithArchiveNotice.migrated, 10);
    assert.equal(summaryWithArchiveNotice.failed, 0);
    assert.equal(summaryWithArchiveNotice.oldPriceArchived, false);

    const summarySuccess: PriceMigrationSummary = {
      ...summaryWithArchiveNotice,
      oldPriceArchived: true,
    };
    assert.equal(summarySuccess.oldPriceArchived, true);
  });
});

describe('Plan Filtering Logic', () => {
  it('filters by plan type', () => {
    const subs = filterPlans(mockPlans, { type: 'subscription' });
    assert.equal(subs.length, 2);
    assert.ok(subs.every((p) => p.planType === 'subscription'));

    const venues = filterPlans(mockPlans, { type: 'venue_membership' });
    assert.equal(venues.length, 2);
    assert.ok(venues.every((p) => p.planType === 'venue_membership'));
  });

  it('filters by active status', () => {
    const active = filterPlans(mockPlans, { isActive: true });
    assert.equal(active.length, 3);
    assert.ok(active.every((p) => p.isActive));

    const inactive = filterPlans(mockPlans, { isActive: false });
    assert.equal(inactive.length, 1);
    assert.equal(inactive[0].key, 'silver');
  });

  it('filters by interface / role', () => {
    const loungeManagerPlans = filterPlans(mockPlans, { role: 'lounge_manager' });
    assert.equal(loungeManagerPlans.length, 2);
    assert.ok(
      loungeManagerPlans.every(
        (p) =>
          p.interfaces?.includes('lounge_manager') ||
          (p.planType === 'subscription' && p.allowedRoles?.includes('lounge_manager'))
      )
    );
  });

  it('filters by search term across label, key, features, and description', () => {
    const byLabel = filterPlans(mockPlans, { search: 'gold' });
    assert.equal(byLabel.length, 1);
    assert.equal(byLabel[0].key, 'gold');

    const byKey = filterPlans(mockPlans, { search: 'vip' });
    assert.equal(byKey.length, 1);
    assert.equal(byKey[0].key, 'vip');

    const byFeature = filterPlans(mockPlans, { search: 'recipients' });
    assert.equal(byFeature.length, 2);

    const byDesc = filterPlans(mockPlans, { search: 'participating' });
    assert.equal(byDesc.length, 1);
    assert.equal(byDesc[0].key, 'vip');
  });

  it('handles combined filters', () => {
    const combined = filterPlans(mockPlans, {
      type: 'subscription',
      isActive: true,
      role: 'user',
      search: 'gold',
    });
    assert.equal(combined.length, 1);
    assert.equal(combined[0].key, 'gold');
  });
});

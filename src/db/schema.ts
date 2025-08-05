import { pgTable, text, timestamp, integer, boolean, uuid, jsonb, index, type AnyPgColumn } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
export * from './auth-schema'

// Components table
export const components = pgTable('components', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  displayName: text('display_name'),
  description: text('description'),
  status: text('status').notNull().default('operational'),
  position: integer('position').notNull().default(0),
  url: text('url'),
  isGroup: boolean('is_group').notNull().default(false),
  parentId: uuid('parent_id').references((): AnyPgColumn => components.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const componentsRelations = relations(components, ({ one, many }) => ({
  parent: one(components, {
    fields: [components.parentId],
    references: [components.id],
    relationName: 'component_parent',
  }),
  children: many(components, {
    relationName: 'component_parent',
  }),
  incidents: many(incidentComponents),
  uptime: many(uptimeChecks),
}))

// Incidents table
export const incidents = pgTable('incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull(),
  impact: text('impact').notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  scheduledFor: timestamp('scheduled_for'),
  scheduledUntil: timestamp('scheduled_until'),
})

export const incidentsRelations = relations(incidents, ({ many }) => ({
  components: many(incidentComponents),
  updates: many(incidentUpdates),
}))

// Junction table for incidents ↔ components
export const incidentComponents = pgTable('incident_components', {
  id: uuid('id').defaultRandom().primaryKey(),
  incidentId: uuid('incident_id').notNull().references(() => incidents.id),
  componentId: uuid('component_id').notNull().references(() => components.id),
}, (table) => ({
  incidentComponentIdx: index('incident_component_idx').on(table.incidentId, table.componentId),
}))

export const incidentComponentsRelations = relations(incidentComponents, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentComponents.incidentId],
    references: [incidents.id],
  }),
  component: one(components, {
    fields: [incidentComponents.componentId],
    references: [components.id],
  }),
}))

// Incident updates
export const incidentUpdates = pgTable('incident_updates', {
  id: uuid('id').defaultRandom().primaryKey(),
  incidentId: uuid('incident_id').notNull().references(() => incidents.id),
  status: text('status').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const incidentUpdatesRelations = relations(incidentUpdates, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentUpdates.incidentId],
    references: [incidents.id],
  }),
}))

// Scheduled maintenances
export const scheduledMaintenances = pgTable('scheduled_maintenances', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull().default('scheduled'),
  message: text('message'),
  scheduledFor: timestamp('scheduled_for').notNull(),
  scheduledUntil: timestamp('scheduled_until').notNull(),
  autoTransition: boolean('auto_transition').notNull().default(true),
  components: jsonb('components').notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
})

export const scheduledMaintenancesRelations = relations(scheduledMaintenances, ({ many }) => ({
  updates: many(maintenanceUpdates),
}))

// Maintenance updates
export const maintenanceUpdates = pgTable('maintenance_updates', {
  id: uuid('id').defaultRandom().primaryKey(),
  maintenanceId: uuid('maintenance_id').notNull().references(() => scheduledMaintenances.id),
  status: text('status').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const maintenanceUpdatesRelations = relations(maintenanceUpdates, ({ one }) => ({
  maintenance: one(scheduledMaintenances, {
    fields: [maintenanceUpdates.maintenanceId],
    references: [scheduledMaintenances.id],
  }),
}))

// Uptime checks
export const uptimeChecks = pgTable('uptime_checks', {
  id: uuid('id').defaultRandom().primaryKey(),
  componentId: uuid('component_id').notNull().references(() => components.id),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  status: text('status').notNull(),
  responseTime: integer('response_time'),
}, (table) => ({
  componentTimestampIdx: index('component_timestamp_idx').on(table.componentId, table.timestamp),
}))

export const uptimeChecksRelations = relations(uptimeChecks, ({ one }) => ({
  component: one(components, {
    fields: [uptimeChecks.componentId],
    references: [components.id],
  }),
}))

/* Subscribers (no relations),
   Reserved for future use
*/
export const subscribers = pgTable('subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  components: jsonb('components'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Settings (no relations)
// Reserved for future use
export const settings = pgTable('settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteName: text('site_name').notNull().default('Status Page'),
  siteUrl: text('site_url'),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  customCss: text('custom_css'),
  customHtml: text('custom_html'),
  customJs: text('custom_js'),
  timezone: text('timezone').notNull().default('UTC'),
  dateFormat: text('date_format').notNull().default('MMM d, yyyy'),
  uptimeHistory: integer('uptime_history').notNull().default(90),
  layoutType: text('layout_type').notNull().default('default'),
  showUptime: boolean('show_uptime').notNull().default(true),
  allowSubscribe: boolean('allow_subscribe').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
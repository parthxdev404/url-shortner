/**
 * @openapi
 * components:
 *   schemas:
 *
 *     AnalyticsOverview:
 *       type: object
 *       properties:
 *         totalClicks:
 *           type: integer
 *           example: 256
 *         uniqueVisitors:
 *           type: integer
 *           example: 183
 *         todayClicks:
 *           type: integer
 *           example: 18
 *
 *     BrowserStats:
 *       type: object
 *       properties:
 *         browser:
 *           type: string
 *           example: Chrome
 *         count:
 *           type: integer
 *           example: 150
 *
 *     OSStats:
 *       type: object
 *       properties:
 *         os:
 *           type: string
 *           example: Windows
 *         count:
 *           type: integer
 *           example: 120
 *
 *     DeviceStats:
 *       type: object
 *       properties:
 *         device:
 *           type: string
 *           example: Desktop
 *         count:
 *           type: integer
 *           example: 190
 *
 *     ReferrerStats:
 *       type: object
 *       properties:
 *         referrer:
 *           type: string
 *           example: Google
 *         count:
 *           type: integer
 *           example: 75
 *
 *     CountryStats:
 *       type: object
 *       properties:
 *         country:
 *           type: string
 *           example: India
 *         count:
 *           type: integer
 *           example: 212
 */
export {};

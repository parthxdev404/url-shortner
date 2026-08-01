/**
 * @openapi
 * components:
 *   schemas:
 *
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalUrls:
 *           type: integer
 *           example: 45
 *         activeUrls:
 *           type: integer
 *           example: 38
 *         inactiveUrls:
 *           type: integer
 *           example: 3
 *         expiredUrls:
 *           type: integer
 *           example: 2
 *         deletedUrls:
 *           type: integer
 *           example: 2
 *         totalClicks:
 *           type: integer
 *           example: 1254
 *
 *     DashboardSummary:
 *       type: object
 *       properties:
 *         stats:
 *           $ref: '#/components/schemas/DashboardStats'
 *         recentUrls:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UrlResponse'
 *         topUrls:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UrlResponse'
 */

export {};

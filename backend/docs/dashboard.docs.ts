/**
 * @openapi
 *
 * /dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Dashboard overview
 *     description: Returns the complete dashboard including statistics, recent URLs and top-performing URLs.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *
 * /dashboard/stats:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Dashboard statistics
 *     description: Returns aggregated statistics for the authenticated user's URLs.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *
 * /dashboard/recent:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Recently created URLs
 *     description: Returns the most recently created URLs for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent URLs retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *
 * /dashboard/top:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Top performing URLs
 *     description: Returns the URLs with the highest number of clicks.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top-performing URLs retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */

export {};

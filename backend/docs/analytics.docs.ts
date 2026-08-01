/**
 * @openapi
 *
 * /analytics/{id}/analytics:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get analytics summary
 *     description: Returns the cached analytics summary and recent click history for a URL.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6875d7c12e6fd4b1b73d6b10
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully.
 *       404:
 *         description: URL not found.
 *
 * /analytics/{urlId}:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Analytics overview
 *     description: Returns high-level analytics metrics for a URL.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: urlId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics overview retrieved successfully.
 *
 * /analytics/{urlId}/timeline:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Click timeline
 *     description: Returns clicks grouped by time for charting.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: urlId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timeline statistics retrieved.
 *
 * /analytics/{urlId}/browser:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Browser statistics
 *     description: Returns browser usage distribution.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: urlId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Browser statistics retrieved.
 *
 * /analytics/{urlId}/os:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Operating system statistics
 *     description: Returns operating system distribution.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: urlId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operating system statistics retrieved.
 *
 * /analytics/{urlId}/device:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Device statistics
 *     description: Returns desktop, mobile and tablet usage.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: urlId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device statistics retrieved.
 *
 * /analytics/{urlId}/referrer:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Referrer statistics
 *     description: Returns traffic sources for a URL.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: urlId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Referrer statistics retrieved.
 *
 * /analytics/{urlId}/country:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Country statistics
 *     description: Returns click distribution by country.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: urlId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Country statistics retrieved.
 */

export {};

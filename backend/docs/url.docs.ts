/**
 * @openapi
 *
 * /urls:
 *   post:
 *     tags:
 *       - URL
 *     summary: Create a short URL
 *     description: Creates a new shortened URL for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUrlRequest'
 *     responses:
 *       201:
 *         description: Short URL created successfully.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 *
 * /urls/{shortCode}:
 *   get:
 *     tags:
 *       - URL
 *     summary: Redirect to original URL
 *     description: Redirects the user to the original URL and records analytics.
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         example: abc123
 *     responses:
 *       302:
 *         description: Redirect successful.
 *       404:
 *         description: Short URL not found.
 *       410:
 *         description: URL expired.
 *
 * /urls/id/{id}:
 *   get:
 *     tags:
 *       - URL
 *     summary: Get URL by ID
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
 *         description: URL retrieved successfully.
 *       404:
 *         description: URL not found.
 *
 * /urls:
 *   get:
 *     tags:
 *       - URL
 *     summary: Get My URLs
 *     description: Returns paginated URLs belonging to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - active
 *             - inactive
 *             - expired
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - createdAt
 *             - clicks
 *             - expiresAt
 *
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *
 *     responses:
 *       200:
 *         description: User URLs fetched successfully.
 *       401:
 *         description: Unauthorized.
 *
 * /urls/trash:
 *   get:
 *     tags:
 *       - URL
 *     summary: Get Deleted URLs
 *     description: Returns paginated soft deleted URLs.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Deleted URLs fetched successfully.
 *       401:
 *         description: Unauthorized.
 *  /urls/id/{id}:
 *   delete:
 *     tags:
 *       - URL
 *     summary: Soft delete a URL
 *     description: Moves a URL to the trash. The URL can later be restored.
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
 *         description: URL moved to trash successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: URL not found.
 *
 * /urls/id/{id}/permanent:
 *   delete:
 *     tags:
 *       - URL
 *     summary: Permanently delete a URL
 *     description: Permanently removes a URL from the database. This action cannot be undone.
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
 *         description: URL permanently deleted.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: URL not found.
 *
 * /urls/bulk:
 *   delete:
 *     tags:
 *       - URL
 *     summary: Bulk delete URLs
 *     description: Soft deletes multiple URLs at once.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkOperationRequest'
 *     responses:
 *       200:
 *         description: URLs deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: One or more URLs not found.
 */

export {};

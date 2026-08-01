/**
 * @openapi
 * components:
 *   schemas:
 *
 *     CreateUrlRequest:
 *       type: object
 *       required:
 *         - originalUrl
 *       properties:
 *         originalUrl:
 *           type: string
 *           format: uri
 *           example: https://google.com
 *         customAlias:
 *           type: string
 *           example: google
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     UpdateUrlRequest:
 *       type: object
 *       properties:
 *         originalUrl:
 *           type: string
 *           format: uri
 *         isActive:
 *           type: boolean
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     BulkOperationRequest:
 *       type: object
 *       required:
 *         - ids
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *
 *     UrlResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         originalUrl:
 *           type: string
 *         shortCode:
 *           type: string
 *         clicks:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         expiresAt:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 */
export {};

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { optimizeRouteAI, detectDelaysAI, detectAddressAI, generateReportAI, getSuggestionsAI } from '../controllers/ai.controller';

const router = Router();
router.use(authenticate);

router.post('/optimize', optimizeRouteAI);
router.get('/delays/:routeId', detectDelaysAI);
router.post('/detect-address', detectAddressAI);
router.post('/generate-report', generateReportAI);
router.get('/suggestions', getSuggestionsAI);

export default router;

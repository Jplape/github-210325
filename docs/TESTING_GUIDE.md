# Guide de Test pour le Projet Maintenance Tracker

## 1. Outils et Configuration

### Outils Principaux
- **Jest** : Framework de test JavaScript
- **ts-jest** : Preprocesseur TypeScript pour Jest
- **ts-node** : Exécution des fichiers de configuration TypeScript
- **Supertest** : Test des routes API (à installer via `npm install --save-dev supertest`)

### Configuration
- `jest.config.ts` : Configuration principale de Jest
- `tsconfig.json` : Configuration TypeScript
- Dossier `__tests__` : Contient tous les fichiers de test

## 2. Types de Tests à Implémenter

### 2.1 Tests Unitaires
- Objectif : Tester des fonctions individuelles
- Emplacement : `src/__tests__/unit/`
- Exemple :
```typescript
import { calculateMaintenanceCost } from '../../utils/maintenanceUtils';

describe('Maintenance Cost Calculation', () => {
  it('should calculate basic maintenance cost', () => {
    const result = calculateMaintenanceCost(100, 0.2);
    expect(result).toBe(120);
  });
});
```

### 2.2 Tests d'Intégration
- Objectif : Tester l'interaction entre plusieurs modules
- Emplacement : `src/__tests__/integration/`
- Exemple :
```typescript
import { EquipmentService } from '../../backend/services/equipmentService';
import { EquipmentModel } from '../../backend/models/equipment';

describe('Equipment Service Integration', () => {
  let service: EquipmentService;
  
  beforeEach(() => {
    service = new EquipmentService(EquipmentModel);
  });

  it('should create and retrieve equipment', async () => {
    const created = await service.createEquipment({ name: 'Test Equipment' });
    const retrieved = await service.getEquipment(created.id);
    expect(retrieved.name).toBe('Test Equipment');
  });
});
```

### 2.3 Tests End-to-End (E2E)
- Objectif : Tester des scénarios complets
- Emplacement : `src/__tests__/e2e/`
- Outils : Supertest pour les tests API
- Exemple :
```typescript
import request from 'supertest';
import app from '../../server';

describe('Equipment API', () => {
  it('GET /api/equipment should return 200', async () => {
    const response = await request(app).get('/api/equipment');
    expect(response.status).toBe(200);
  });
});
```

## 3. Bonnes Pratiques

### 3.1 Organisation des Tests
- Utiliser la structure AAA (Arrange, Act, Assert)
- Un seul concept par test
- Nommage descriptif des tests

### 3.2 Couverture de Code
- Objectif : 80% minimum
- Commandes :
  - `npm test` : Exécute tous les tests
  - `npm test -- --coverage` : Génère un rapport de couverture

### 3.3 Tests Fiables
- Utiliser des mocks pour les dépendances externes
- Isoler les tests les uns des autres
- Utiliser des factories pour générer des données de test

## 4. Workflow de Test

1. Écrire les tests avant le code (TDD)
2. Exécuter les tests localement avant chaque commit
3. Intégrer les tests dans le pipeline CI/CD
4. Surveiller les métriques de couverture

## 5. Critères d'Évaluation

- Tous les tests doivent passer
- Aucun test ne doit être marqué comme skipped
- La couverture de code doit être maintenue
- Les tests doivent être rapides et fiables
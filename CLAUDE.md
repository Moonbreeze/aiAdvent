# Code Agreement

## TypeScript

### Именование

- **Файлы**: `camelCase.ts` (например: `textMessage.ts`, `sessionManager.ts`)
- **Переменные и функции**: `camelCase`
- **Типы**: `PascalCase`
- **Константы**: `SCREAMING_SNAKE_CASE`

### Типы

- Использовать `type` вместо `interface`, насколько это возможно
- Типы и константы выносить в отдельные файлы `types.ts` и `constants.ts`
- Избегать кастов через `as` — использовать тайпгарды

#### Enum-подобные типы

Перечисления должны быть основаны на массиве литералов `as const` и сопровождаться тайпгардом:

```typescript
const MODES = ['chat', 'assistant', 'code'] as const;
type Mode = typeof MODES[number];

const isMode = (value: unknown): value is Mode => {
  return typeof value === 'string' && MODES.includes(value as Mode);
};
```

### Функции

- Использовать стрелочные функции вместо обычных
- Использовать `async/await` вместо `.then().catch().finally()`

### Обработка ошибок

- Использовать `try/catch` для обработки ошибок

### Структура проекта

- Архитектурные директории (`services`, `commands`, `handlers` и т.д.) должны иметь `index.ts` с экспортами

### Импорты

Порядок импортов (группы разделять пустой строкой):

1. Внешние библиотеки
2. Внутренние модули

```typescript
import { Telegraf } from 'telegraf';
import axios from 'axios';

import { SessionManager } from './services';
import { MODES } from './constants';
import { Mode } from './types';
```

#### Изоляция модулей

Импорты из архитектурных директорий (`services`, `commands`, `handlers` и т.д.) должны выполняться **только через `index.ts`** этой директории:

```typescript
// Правильно
import { sessionManager, fetchYandexGpt } from '../services';

// Неправильно
import { sessionManager } from '../services/sessionManager';
import { fetchYandexGpt } from '../services/yandexGpt';
```

Внутри самой директории модули могут импортировать друг друга напрямую.

### Документация

- Каждый экспорт должен быть снабжён JSDoc
- Не-экспортируемые элементы снабжать JSDoc, если они используются более чем в одном месте
- Комментарии в коде — умеренно, без фанатизма

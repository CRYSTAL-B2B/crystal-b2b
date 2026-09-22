export const AVATAR_QUESTION = 'Какие у вас задачи:';
export const AVATAR_TASKS = [
  'Сформировать стратегию.',
  'Настроить лидогенерацию.',
  'Построить систему привлечения.',
  'Автоматизация бизнеса.',
] as const;

export const AVATAR_SECTIONS = [
  { id: 'system', selector: '#system', label: 'Что такое система', description: 'Свяжите исследование, маркетинг, CRM, продажи и аналитику в единый процесс.' },
  { id: 'results', selector: '#results', label: 'Подтверждённые результаты', description: 'Посмотрите, как изменения в процессах отражаются на скорости обработки лидов и результатах бизнеса.' },
  { id: 'offer', selector: '#offer', label: 'Форматы работы', description: 'Выберите старт: аудит системы, автоматизация одного процесса или сервис под ключ.' },
  { id: 'flow', selector: '.flow-scene', label: 'Управление потоком', description: 'Найдите, где теряются обращения, и свяжите данные, CRM и продажи.' },
  { id: 'cases', selector: '#cases', label: 'Кейсы', description: 'Посмотрите, какие изменения в маркетинге и процессах привели к измеримому результату.' },
  { id: 'contact', selector: '#contact', label: 'Контакт', description: 'Расскажите о задаче — обсудим, с чего начать и какой формат работы подойдёт.' },
] as const;
export type AvatarSection = typeof AVATAR_SECTIONS[number];
export type AvatarContext = { section: AvatarSection };

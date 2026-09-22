export const AVATAR_QUESTION = 'Какие у вас задачи:';
export const AVATAR_TASKS = [
  'Сформировать стратегию.',
  'Настроить лидогенерацию.',
  'Построить систему привлечения.',
  'Автоматизация бизнеса.',
] as const;

export const AVATAR_SECTIONS = [
  { id: 'system', selector: '#system', label: 'Что такое система', description: 'Для максимизации прибыли свяжите маркетинг, CRM, продажи и аналитику в единый процесс.' },
  { id: 'results', selector: '#results', label: 'Подтверждённые результаты', description: 'Посмотрите, как точечная оптимизация в воронке продаж отражается на реальных результатах бизнеса' },
  { id: 'offer', selector: '#offer', label: 'Форматы работы', description: 'Выберите первый шаг: аудит системы, автоматизация бизнес-процесса или системный маркетинг под ключ' },
  { id: 'flow', selector: '.flow-scene', label: 'Управление потоком', description: 'Найдём, где бизнес теряет обращения, определим точку роста и следующий шаг' },
  { id: 'cases', selector: '#cases', label: 'Кейсы', description: 'Посмотрите, какие изменения в маркетинге и процессах привели к измеримому результату.' },
  { id: 'contact', selector: '#contact', label: 'Контакт', description: 'Расскажите о задаче – обсудим, с чего начать и какой формат работы даст лучший результат.' },
] as const;
export type AvatarSection = typeof AVATAR_SECTIONS[number];
export type AvatarContext = { section: AvatarSection };

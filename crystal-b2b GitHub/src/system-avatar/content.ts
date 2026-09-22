export const AVATAR_QUESTION = 'Какие у вас задачи:';
export const AVATAR_TASKS = [
  'Сформировать стратегию.',
  'Настроить лидогенерацию.',
  'Построить систему привлечения.',
  'Автоматизация бизнеса.',
] as const;

/** Надпись на кнопке плашки по умолчанию; секция может задать свою. */
export const AVATAR_CTA = 'Обсудить задачу';

export type AvatarSection = {
  id: string;
  selector: string;
  label: string;
  description: string;
  cta?: string;
};

export const AVATAR_SECTIONS: readonly AvatarSection[] = [
  { id: 'system', selector: '#system', label: 'Что такое система', description: 'Для максимизации прибыли свяжите маркетинг, CRM, продажи и аналитику в единый процесс.', cta: 'Как это сделать?' },
  { id: 'results', selector: '#results', label: 'Подтверждённые результаты', description: 'Посмотрите, как точечная оптимизация в воронке отражается на реальных результатах бизнеса.' },
  // Переносы строк выводятся как есть: у .avatar-bubble-primary задан
  // white-space: pre-line.
  { id: 'offer', selector: '#offer', label: 'Форматы работы', description: 'Выберите первый шаг:\n- аудит системы\n- автоматизация бизнес-процесса\n- системный маркетинг под ключ' },
  { id: 'flow', selector: '.flow-scene', label: 'Управление потоком', description: 'Найдём, где бизнес теряет обращения, определим точку роста и следующий шаг.' },
  { id: 'cases', selector: '#cases', label: 'Кейсы', description: 'Посмотрите примеры, как изменения в маркетинге и процессах дали измеримый результат.' },
  { id: 'contact', selector: '#contact', label: 'Контакт', description: 'Расскажите о вашей задаче – определим, с чего начать и какой формат работы даст лучший результат.' },
];
export type AvatarContext = { section: AvatarSection };

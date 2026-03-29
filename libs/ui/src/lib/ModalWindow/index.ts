import { ModalWindow as ModalComponent } from './ModalWindow';
import { Title, Content, Actions } from './Content';
import { ActionButton } from './ActionButton';

export type { ModalWindowApi, ModalWindowProps } from './ModalWindow';

export const ModalWindow = Object.assign(ModalComponent, {
  Title,
  Content,
  Actions,
  ActionButton,
});

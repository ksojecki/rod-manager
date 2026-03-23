import { Modal as ModalComponent } from './Modal';
import { Title, Content, Actions } from './Content';
import { ActionButton } from './ActionButton';

export type { ModalApi } from './Modal';

export const Modal = Object.assign(ModalComponent, {
  Title,
  Content,
  Actions,
  ActionButton,
});

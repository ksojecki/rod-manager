import { Modal as ModalComponent } from './Modal';
import { Title, Content } from './Content';

export type { ModalApi } from './Modal';

export const Modal = Object.assign(ModalComponent, {
  Title,
  Content,
});

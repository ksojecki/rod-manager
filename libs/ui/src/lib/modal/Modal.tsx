import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { ActionType, ContentType, TitleType } from './Content';
import { FaCircleXmark } from 'react-icons/fa6';

export type ModalApi = {
  show: () => void;
  close: () => void;
};

export type ModalProps = {
  children: [TitleType, ContentType, ActionType];
  api: RefObject<ModalApi | null>;
};

export const Modal = ({ api, children }: ModalProps) => {
  const modal = useRef<HTMLDialogElement | null>(null);
  useLayoutEffect(() => {
    api.current = {
      show: () => {
        showDialog(modal.current);
      },
      close: () => {
        closeDialog(modal.current);
      },
    };
  }, [api]);

  const [title, content, actions] = children;

  return (
    <dialog className="modal" ref={modal}>
      <div className="modal-box w-11/12 max-w-5xl">
        {title}
        {content}
        <form method="dialog" className="modal-action">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">
            <FaCircleXmark className="h-4 w-4" />
          </button>
          {actions}
        </form>
      </div>
    </dialog>
  );
};

function showDialog(dialog: HTMLDialogElement | null) {
  if (dialog === null) {
    return;
  }

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
    return;
  }

  // JSDOM fallback: emulate <dialog open> state when showModal is not implemented.
  dialog.setAttribute('open', '');
}

function closeDialog(dialog: HTMLDialogElement | null) {
  if (dialog === null) {
    return;
  }

  if (typeof dialog.close === 'function') {
    dialog.close();
    return;
  }

  dialog.removeAttribute('open');
}

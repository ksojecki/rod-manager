import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { ContentType, TitleType } from './Content';

export type ModalApi = {
  show: () => void;
  close: () => void;
};

export type ModalProps = {
  children: [TitleType, ContentType];
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

  const [title, content] = children;

  return (
    <dialog className="modal" ref={modal}>
      <div className="modal-box w-11/12 max-w-5xl">
        {title}
        {content}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
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

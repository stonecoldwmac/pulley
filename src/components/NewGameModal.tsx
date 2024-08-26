import { generateSlug } from 'random-word-slugs';
import { useEffect, useRef, useState } from 'react';

const NewGameModal = ({
  isOpen,
  onClose,
  handleSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: (gameName: string, questionCount: number) => void;
}): JSX.Element => {
  const ref = useRef<HTMLDialogElement>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [name, setName] = useState<string>(generateSlug());

  useEffect(() => {
    if (isOpen && ref.current) {
      // reset
      setQuestionCount(5);
      setName(generateSlug());
      // show modal
      ref.current.showModal();
    }
  }, [isOpen]);

  return (
    <dialog id='my_modal_1' className='modal' ref={ref} onClose={onClose}>
      <div className='modal-box'>
        <h3 className='font-bold text-lg mb-4'>Game Set Up</h3>
        <label className='input input-bordered flex items-center justify-between gap-4 font-semibold mb-4'>
          Game Name
          <input
            type='text'
            className='grow w-60 mr-4 grow-0 font-normal'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className='input input-bordered flex items-center gap-4 justify-between font-semibold'>
          Question Count
          <div className='flex items-center gap-2'>
            <input
              type='range'
              min={0}
              max={25}
              value={questionCount}
              className='range range-secondary w-60'
              onChange={(e) => {
                setQuestionCount(e.target.valueAsNumber);
              }}
            />
            <span className='font-normal w-3'>{questionCount}</span>
          </div>
        </label>
        <div className='modal-action'>
          <form method='dialog' className=''>
            {/* if there is a button in form, it will close the modal */}
            <button className='btn mx-2 btn-error'>Close</button>
            <button
              type='submit'
              className='btn ml-2 btn-success'
              onClick={() => handleSubmit(name, questionCount)}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};
export default NewGameModal;

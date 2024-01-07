import { useRef } from 'react';

const useCopyToClipboard = <T extends HTMLElement>() => {
  const textRef = useRef<T>(null);

  const copyToClipboard = () => {
    if (textRef.current) {
      const textToCopy = textRef.current.innerText;
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return { textRef, copyToClipboard };
};

export default useCopyToClipboard;

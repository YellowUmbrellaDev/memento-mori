import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';

const Memer = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [imgURLs, setImgURLs] = useState<string[]>([]);

  useEffect(() => {
    const canvasInstance = initCanvas();
    setCanvas(canvasInstance);
    window.addEventListener('keydown', (e: KeyboardEvent) => handleKeyDown(e, canvasInstance));
    canvasInstance.on('mouse:dblclick', (options: fabric.IEvent) => {
      if (options.target && options.target.type === 'text') {
        const textTarget = options.target as fabric.IText;
        textTarget.enterEditing();
      }
    });
    return () => {
      window.removeEventListener('keydown', (e: KeyboardEvent) => handleKeyDown(e, canvasInstance));
      canvasInstance.off('mouse:dblclick');
    };
  }, []);

  const initCanvas = () => (
    new fabric.Canvas('canvas', {
      height: 400,
      width: 400,
      backgroundColor: 'pink'
    })
  )

  const handleKeyDown = (e: KeyboardEvent, canvi: fabric.Canvas) => {
    if (e.key === 'Delete' ) {
      const activeObjects = canvi.getActiveObjects();
      if (activeObjects.length) {
        activeObjects.forEach((object: fabric.Object) => {
          canvi.remove(object);
        });
        canvi.discardActiveObject().renderAll();
      }
    }
  };


  const addText = (canvi: fabric.Canvas, textString: string) => {
    const text = new fabric.IText(textString, {
      left: 10,
      top: 10,
      fontFamily: 'arial',
      angle: 0,
      fill: 'black',
      scaleX: 0.5,
      scaleY: 0.5,
      fontWeight: '',
      originX: 'left',
      hasRotatingPoint: true,
    });
    canvi.add(text);
    canvi.renderAll();
  }

  const addImg = (e: React.FormEvent, urls: string[], canvi: fabric.Canvas) => {
    e.preventDefault();
    urls.forEach(url => {
      fabric.Image.fromURL(url, (img: fabric.Image) => {
        img.scale(0.25);
        if (canvi) {
          canvi.add(img);
          canvi.renderAll();
        }
      });
    });
    setImgURLs([]);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files as FileList);
    const urls = files.map(file => URL.createObjectURL(file));
    setImgURLs(urls);
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData?.items) {
      const file = Array.from(e.clipboardData.items).find(item => item.kind === 'file');
      if (file) {
        const blob = file.getAsFile();
        if (blob) {
          addImg({ preventDefault: () => {} } as React.FormEvent, [URL.createObjectURL(blob)], canvas!);
        }
      } else {
        alert(
          "No image data was found in your clipboard. Copy an image first or take a screenshot."
        );
      }
    }
  };

  const exportAsPNG = (canvi: fabric.Canvas) => {
    const dataURL = canvi.toDataURL({
      format: 'png',
      quality: 1
    });
    const link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = dataURL;
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  }
  
  return(
    <div className="flex justify-center items-center h-screen" onPaste={handlePaste}>
      <div className="flex flex-col items-center justify-center">
        <h1 className="mb-4">Memer test</h1>
        <canvas id="canvas" className="border-2 border-gray-300"/>
      </div>
      <div className="ml-10">
        <button 
          onClick={() => addText(canvas!, 'New Text')} 
          className="mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Text
        </button>
        <button 
          onClick={() => exportAsPNG(canvas!)} 
          className="mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Export as PNG
        </button>
        <form onSubmit={e => addImg(e, imgURLs, canvas!)}>
          <div className="mb-2">
            <input 
              type="file" 
              onChange={handleImageUpload} 
              multiple
              className="mb-2"
            />
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Image
            </button>
          </div>
        </form>
      </div>
    </div>
  ); 
}

export default Memer;
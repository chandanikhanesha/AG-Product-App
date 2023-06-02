import React, { Component } from 'react';

import './signer.css';

let requestAnimFrame = (function (callback) {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimaitonFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

// function convertURIToImageData(URI) {
//   return new Promise(function(resolve, reject) {
//     if (URI == null) return reject();
//     var canvas = document.createElement('canvas'),
//         context = canvas.getContext('2d'),
//         image = new Image();
//     image.addEventListener('load', function() {
//       canvas.width = image.width;
//       canvas.height = image.height;
//       context.drawImage(image, 0, 0, canvas.width, canvas.height);
//       resolve(context.getImageData(0, 0, canvas.width, canvas.height));
//     }, false);
//     image.src = URI;
//   });
// }

function getMousePos(canvasDom, mouseEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top,
  };
}

function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top,
  };
}

class InvoiceSigner extends Component {
  constructor(props) {
    super(props);

    this.saveSignature = this.saveSignature.bind(this);
  }

  state = {
    canvas: null,
    saved: false,
    imgSrc: null,
  };

  saveSignature() {
    // convertURIToImageData(this.state.canvas.toDataURL())
    // .then(imageData => {
    //   console.log(imageData)
    //   this.setState({
    //     imgSrc: imageData
    //   })
    // })

    this.setState({
      saved: true,
      imgSrc: this.state.canvas.toDataURL(),
    });
  }

  componentDidMount() {
    let canvas = document.getElementById('signer-canvas');
    let context = canvas.getContext('2d');
    let drawing = false;
    let mousePos = { x: 0, y: 0 };
    let lastPos = mousePos;

    this.setState({
      canvas,
    });

    canvas.addEventListener(
      'mousedown',
      (e) => {
        drawing = true;
        lastPos = getMousePos(canvas, e);
      },
      false,
    );
    canvas.addEventListener(
      'mouseup',
      (e) => {
        drawing = false;
      },
      false,
    );
    canvas.addEventListener(
      'mousemove',
      (e) => {
        mousePos = getMousePos(canvas, e);
      },
      false,
    );

    canvas.addEventListener('touchstart', (e) => {
      mousePos = getTouchPos(canvas, e);
      let touch = e.touches[0];
      let mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    });
    canvas.addEventListener('touchend', (e) => {
      let mouseEvent = new MouseEvent('mouseup', {});
      canvas.dispatchEvent(mouseEvent);
    });
    canvas.addEventListener('touchmove', (e) => {
      let touch = e.touches[0];
      let mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    });

    function renderCanvas() {
      if (drawing) {
        context.moveTo(lastPos.x, lastPos.y);
        context.lineTo(mousePos.x, mousePos.y);
        context.stroke();
        lastPos = mousePos;
      }
    }

    (function drawLoop() {
      requestAnimFrame(drawLoop);
      renderCanvas();
    })();

    // Prevent scrolling when touching the canvas
    document.body.addEventListener(
      'touchstart',
      function (e) {
        if (e.target === canvas) {
          e.preventDefault();
        }
      },
      false,
    );
    document.body.addEventListener(
      'touchend',
      function (e) {
        if (e.target === canvas) {
          e.preventDefault();
        }
      },
      false,
    );
    document.body.addEventListener(
      'touchmove',
      function (e) {
        if (e.target === canvas) {
          e.preventDefault();
        }
      },
      false,
    );
  }

  render() {
    return (
      <div>
        {!this.state.saved && <canvas id="signer-canvas" width="490" height="220"></canvas>}
        {this.state.imgSrc && <img className="iimmg" alt="signature" src={this.state.imgSrc} />}
        {!this.state.saved && <button onClick={this.saveSignature}>save signature</button>}
      </div>
    );
  }
}

export default InvoiceSigner;

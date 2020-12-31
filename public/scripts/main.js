let output = document.getElementById('b-main__output__block');
let tempImage = document.getElementById('temp_image');
let dropAreaPreview = document.getElementById('drop_area');
let imageSrcPreview = document.getElementById('temp_image_src');
let file;
let myArr = [];
let text = '';
let ready = false;

// ErrorHandler handling -- //

let errors = {
  notImage: 'Uploaded file is not an image',
  noImage: 'Please select a file',
  network: 'Network error',
  unexcepted: 'Unexpected error'
};

let alerts = {
  sent: 'Message was sent successfuly',
};

class AlertHandler {
  constructor(alertMsg) {
    this.alertMsg = alertMsg;
  }
  display() {
    let alertMessage = document.querySelector('#alert_message');
    let alert = document.querySelector('.alert');
    alertMessage.innerText = this.alertMsg;
    alert.classList.remove('destroy_alert');
    alert.classList.add('alert_validate');
    alert.classList.add('spawn_alert');
    setTimeout(() => {
      alert.classList.remove('spawn_alert');
      alert.classList.remove('alert_validate');
      alert.classList.add('destroy_alert');
    }, 5000);
  }
}

class ErrorHandler {
  constructor(alertMsg) {
    this.alertMsg = alertMsg;
  }
  display() {
    let alertMessage = document.querySelector('#alert_message');
    let alert = document.querySelector('.alert');
    alertMessage.innerText = this.alertMsg;
    alert.classList.remove('destroy_alert');
    alert.classList.add('alert_warning');
    alert.classList.add('spawn_alert');
    setTimeout(() => {
      alert.classList.remove('spawn_alert');
      alert.classList.remove('alert_warning');
      alert.classList.add('destroy_alert');
    }, 5000);
  }
}

// Navigation Mobile --
let burgerMenu = document.getElementById('burger-menu');
let mobile = document.getElementById('mobile');

burgerMenu.addEventListener('click', () => {
  if (mobile.classList.contains('navOn')) {
    mobile.classList.remove('navOn');
    mobile.classList.add('navOff');
  } else {
    mobile.classList.remove('navOff');
    mobile.classList.add('navOn');
  }
});


class PicToAscii {
  constructor(img, res, isImage) {
    this.img = img;
    this.isImage = isImage;
    this.width = res;
    this.height = undefined;
    this.res = res;
    this.pass = res;
    this.backgroundColor = '#1a1e23';
    this.textColor = '#fff';
    this.accentColor = '#F2166A';
    this.stretchRatio = 0.49;
    this.imageMultiplierRatio = 10;
    this.slot = 1;
    this.alphaData = [];
    this.sortedAlphaData = [];
    // this.shadingVal10 = ' .:-=+*#%@';
    this.shadingVal10 = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
  }
  loadSignature() {
    return new Promise((resolve, reject) => {
      let signatureImage = new Image();
      let pathToSignatureImage = './public/misc/signature.png';
      signatureImage.onload = () => {
        resolve(signatureImage);
      };
      signatureImage.src = pathToSignatureImage;
    });
  }

  ratioCalculator() {
    if (this.isImage) {
      return Math.floor(((this.img.height / this.img.width) * this.imageMultiplierRatio * this.width));
    } else {
      return Math.floor(((this.img.height / this.img.width) * this.stretchRatio * this.width));
    }
  }

  normalizeRange(val, shadesLength) {
    return Math.floor(val / 255 * (shadesLength - 1));
  }

  async drawOnMemoryCanvasText() {
    return new Promise((resolve, reject) => {
      let ctx = document.createElement('canvas').getContext('2d');
      this.height = this.ratioCalculator();
      ctx.canvas.width = this.width;
      ctx.canvas.height = this.height;
      ctx.drawImage(this.img, 0, 0, this.width, this.height);
      resolve(ctx);
    });
  }

  async drawOnMemoryCanvasImage() {
    let signature = await this.loadSignature();
    return new Promise((resolve, reject) => {
      let ctx = document.createElement('canvas').getContext('2d');
      this.height = this.ratioCalculator();
      this.width = this.width * this.imageMultiplierRatio;
      ctx.canvas.width = this.width;
      ctx.canvas.height = this.height;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillStyle = this.textColor;
      ctx.font = '18px Monospace';
      if (myArr) {
        let y = 30;
        let x = 26;
        let lastCharX;
        const adderX = (ctx.canvas.width - 60) / myArr[0].length;
        const adderY = (ctx.canvas.height - 40) / myArr.length;

        for (let i = 0; i < myArr.length; i++) {
          let currentSlot = myArr[i];
          for (let j = 0; j < currentSlot.length; j++) {
            let currentChar = currentSlot[j];
            ctx.fillText(currentChar, x, y);
            x += adderX;
            if (j == currentSlot.length - 1) {
              lastCharX = x;
              x = 26;
            }
          }
          y += adderY;
        }
        let ratioTobeRemoved = 10 / 100 * ctx.canvas.width;
        ctx.drawImage(signature, (lastCharX - signature.width / 2) - 9, ctx.canvas.height - ratioTobeRemoved - signature.height);
      }
      resolve(ctx);
    });
  }

  async arrayManipulation() {
    let ctx = this.isImage ? await this.drawOnMemoryCanvasImage() : await this.drawOnMemoryCanvasText();

    return new Promise((resolve, reject) => {

      if (!this.isImage) {
        text = '';
        myArr = [];
        // Draw the image on the memory canvas.
        // Get all pixel data from canvas.
        let imageData = ctx.getImageData(0, 0, this.width, this.height).data;
        for (let i = 0; i < imageData.length; i += 4) {
          this.alphaData.push(imageData[i]);
        }
        /*
         * loop throught alphaData array.
         * and set the current slot based on the image width
         */
        for (let i = 0; i < this.alphaData.length; i++) {
          if (i >= this.pass) {
            this.slot++;
            this.pass += this.res;
          }
          // Initialize an array before pushing data to it.
          if (this.sortedAlphaData[this.slot - 1] == undefined) {
            this.sortedAlphaData[this.slot - 1] = [];
          }
          /*
           * Normalizing the alpha range to a the range of shadingVal10 array
           * and then pushing it to sortedAlphaData array.
           */
          let alphaData = this.alphaData[i];
          let grayscaleLen = this.shadingVal10.length;
          // this.shadingVal10.reverse();
          this.sortedAlphaData[this.slot - 1].push(this.shadingVal10[this.normalizeRange(alphaData, grayscaleLen)]);
        }
        this.slot = this.width;
        // looping throught sortedAlphaData array.
        for (let i = 0; i < this.sortedAlphaData.length; i++) {
          let currentSlot = this.sortedAlphaData[i];
          myArr.push(currentSlot.join(' '));
          // looping through each slot of srotedAlphaData array.
          for (let j = 0; j < currentSlot.length; j++) {
            if (currentSlot.length == this.slot) {
              currentSlot.push('\n')
            }
            text += currentSlot[j];
          }
        }

        let signature = {
          link: 'Generated by -> www.pic2text.com',
          prepare(slot) {
            let whiteSpaceCount = Math.floor((slot - this.link.length) / 2);
            let concatenatedStr = ' '.repeat(whiteSpaceCount) + this.link;
            return concatenatedStr;
          }
        };

        output.innerText = text;
        text += signature.prepare(this.slot);
      }
      resolve(ctx);
    })
  };

  async output() {
    let ctx = await this.arrayManipulation();
    return new Promise((resolve, reject) => {
      if (this.isImage) {
        resolve({
          base64Image: ctx.canvas.toDataURL().replace(/^data:image\/png;base64,/, '')
        });
      } else {
        setTimeout(() => {
          resolve({
            convertedText: text
          });
        }, 3000)

      }
    });
  }
}

// -- File Upload -- //
let instantiateClassArray = [];
const inputFile = document.getElementById('file');

// Input file 
if (inputFile) {
  inputFile.addEventListener('input', async e => {
    file = e.target.files[0];
    let isValidImage = await validateImage(file)
      .catch(err => {
        new ErrorHandler(errors.notImage).display();
      })
    if (!!isValidImage) {
      previewImage(true);
    } else {
      new ErrorHandler(errors.notImage).display();
    }
  });

  // ** Reseting file target value to keep change event working when uploading same files ** //
  inputFile.addEventListener('click', e => {
    e.target.value = '';
  });
}
// draging

let dropArea = document.getElementById('b-main__upload__droparea');

if (dropArea) {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
    }, false)
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
      dropArea.classList.add('highlight');
    }, false)
  });
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
      dropArea.classList.remove('highlight');
    }, false)
  });

  dropArea.addEventListener('drop', async e => {
    file = e.dataTransfer.files[0];
    let isValidImage = await validateImage(file);
    if (!!isValidImage) {
      previewImage(true);
    } else {
      new ErrorHandler(errors.notImage).display();
    }
  }, false)
}

async function previewImage(bool) {
  try {
    if (bool) {
      imageSrcPreview.src = URL.createObjectURL(file);
      if (tempImage.classList.contains('hide')) {
        tempImage.classList.remove('hide');
      }
      if (dropAreaPreview.classList.contains('show')) {
        dropAreaPreview.classList.remove('show');
      }
      tempImage.classList.add('show');
      dropAreaPreview.classList.add('hide');
      ready = true;
      const deleteButton = document.getElementById('delete');
      deleteButton.addEventListener('click', () => {
        previewImage(false);
        // clear Image array;
        instantiateClassArray = [];
        ready = false;
      }, false);

    } else {
      imageSrcPreview.src = '';
      file = null;
      if (tempImage.classList.contains('show')) {
        tempImage.classList.remove('show');
      }
      if (dropAreaPreview.classList.contains('hide')) {
        dropAreaPreview.classList.remove('hide');
      }
      dropAreaPreview.classList.add('show');
      tempImage.classList.add('hide');
    }
  } catch (error) {
    new ErrorHandler(error).display();
  }
}

function validateImage(file) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => {
      resolve(true);
    }
    image.onerror = () => {
      reject(errors.notImage);
    }
    image.src = URL.createObjectURL(file);
  })
}
const returnButton = document.getElementById('main__output__return__btn');
const convertButton = document.getElementById('convert');
const loader = document.getElementById('loader')

if (convertButton) {
  convertButton.addEventListener('click', () => {
    if (ready) {
      convertBtnVisibility(false);
      loadingAnimation(true);
      let imageWidth = parseInt(imageWidthInput.value, 10);
      if (imageWidth >= minNum && imageWidth <= maxNum) {} else {
        imageWidthInput.value = 100;
      }
      convertPic2Text(file);
    } else {
      new ErrorHandler(errors.noImage).display();
    }
  }, false)
}


let uploadSection = document.getElementById('b-main__upload');
let outputSection = document.getElementById('b-main__output');
let outputSectionPreviewImage = document.getElementById('main__output__return__preview');

let image = new Image();

function convertPic2Text(file) {
  const textButton = document.getElementById('text');
  const imageButton = document.getElementById('jpg');
  let src = URL.createObjectURL(file);
  if (file) {
    let w = parseInt(imageWidthInput.value, 10);
    image.src = outputSectionPreviewImage.src = src;
    image.onload = () => {
      instantiateClassArray.push(new PicToAscii(image, w, false));
      instantiateClassArray.push(new PicToAscii(image, w, true));
      let executeOutputFunc = instantiateClassArray.map(item => item.output());
      Promise.all(executeOutputFunc)
        .then(data => {
          ajaxRequest('POST', '/prepare', JSON.stringify({
              data
            }))
            .then(
              res => {
                return JSON.parse(res);
              }
            )
            .then(data => {
              if (data.error) {
                new ErrorHandler(errors.unexcepted).display();
              } else {
                return data;
              }
            })
            .then(
              ({
                paths
              }) => {
                imageButton.setAttribute('href', paths.imagePath);
                textButton.setAttribute('href', paths.textPath);
                toggleUpDownSections(true);
                convertBtnVisibility(true)
                loadingAnimation(false)
              })
            .catch(err => {
              new ErrorHandler(errors.network).display();
            })
        })
    }
  }
}

function toggleUpDownSections(bool) {
  if (bool) {
    if (outputSection.classList.contains('hide')) {
      outputSection.classList.remove('hide');
    }
    if (uploadSection.classList.contains('show')) {
      uploadSection.classList.remove('show');
    }
    outputSection.classList.add('show');
    uploadSection.classList.add('hide');

  } else {
    if (outputSection.classList.contains('show')) {
      outputSection.classList.remove('show');
    }
    if (uploadSection.classList.contains('hide')) {
      uploadSection.classList.remove('hide');
    }
    outputSection.classList.add('hide');
    uploadSection.classList.add('show');
  }
}
if (returnButton) {
  returnButton.addEventListener('click', () => {
    text = '';
    myArr = [];
    instantiateClassArray = [];
    toggleUpDownSections(false);
    image.src = '';
  }, false);
}

// ** numbers

let numUp = document.getElementById('num-up');
let numDown = document.getElementById('num-down');
let imageWidthInput = document.getElementById('image_width');
let imageWidthInputVal;
let maxNum = imageWidthInput ? parseInt(imageWidthInput.max) : null;
let minNum = imageWidthInput ? parseInt(imageWidthInput.min) : null;



if (numDown && numDown) {
  [numUp, numDown].forEach(el => {
    imageWidthInputVal = parseInt(imageWidthInput.value, 10);
    el.addEventListener('click', e => {
      if (e.target.innerText == '+') {
        if (imageWidthInputVal < maxNum) {
          imageWidthInput.value = imageWidthInputVal;
          imageWidthInputVal++;
        } else {
          imageWidthInput.value = maxNum;
        }
      }
      if (e.target.innerText == '-') {
        if (imageWidthInputVal > minNum) {
          imageWidthInput.value = imageWidthInputVal;
          imageWidthInputVal--;
        } else {
          imageWidthInput.value = minNum;
        }
      }
    }, false)
  });
  ['input', 'change'].forEach(eventName => {
    imageWidthInput.addEventListener(eventName, () => {
      imageWidthInputVal = parseInt(imageWidthInput.value, 10);
    }, false)
  });
}


//** show and hide download button */
let downloadBlock = document.getElementById('b-main__output__download');
let downloadBlockCtn = document.getElementById('b-main__output__block__container');

if (downloadBlock) {

  [output, downloadBlock].forEach(el => {
    el.addEventListener('mouseover', () => {
      if (downloadBlock.classList.contains('hideDownload')) {
        downloadBlock.classList.remove('hideDownload')
      }
      downloadBlock.classList.add('showDownload');

      let hoverClass = 'hover_on_download';
      downloadBlockCtn.classList.contains(hoverClass) ? downloadBlockCtn.classList.remove(hoverClass) : downloadBlockCtn.classList.add(hoverClass);

    }, false)
  });

  [output, downloadBlock].forEach(el => {
    el.addEventListener('mouseout', () => {
      if (downloadBlock.classList.contains('showDownload')) {
        downloadBlock.classList.remove('showDownload')
      }
      downloadBlock.classList.add('hideDownload');

      let hoverClass = 'hover_on_download';
      if (downloadBlockCtn.classList.contains(hoverClass)) downloadBlockCtn.classList.remove(hoverClass);
    }, false)
  });
}

// send mail

let send = document.querySelector('#send');
let [inputName, inputEmail, inputMessage] = document.querySelectorAll('.input');

if (inputName && inputEmail && inputMessage) {
  [inputName, inputEmail, inputMessage].forEach(el => {
    el.addEventListener('input', () => {
      if (el.nextElementSibling.classList.contains('spawnError')) {
        el.nextElementSibling.classList.remove('spawnError');
      }
    })
  })
}

if (send) {
  send.addEventListener('click', e => {
    e.preventDefault();
    resetError();
    let form = [{
      inputName: 'name',
      inputValue: inputName.value,
      re: /\S{3,40}/g
    }, {
      inputName: 'email',
      inputValue: inputEmail.value,
      re: /\S+@\S+\.\S+/
    }, {
      inputName: 'message',
      inputValue: inputMessage.value,
      re: /^.{10,1000}/
    }];
    let validationResult = validateForm(form);
    if (validationResult) {
      ajaxRequest('POST', '/mail', JSON.stringify({
          name: form[0]['inputValue'],
          email: form[1]['inputValue'],
          message: form[2]['inputValue']
        }))
        .then(res => JSON.parse(res))
        .then(({
          mailErrors,
          formErrors,
          message
        }) => {
          //console.log('This is from backend-end', formErrors)
          message ? (new AlertHandler(alerts.sent).display(), clearFields([inputName, inputEmail, inputMessage])) : (displayErrors(formErrors),
            mailErrors ? new ErrorHandler(errors.network).display() : null);
        })
    }
  })
}

function clearFields(arr) {
  arr.forEach(el => {
    el.value = '';
  })
}

function resetError() {
  document.querySelectorAll('.field_error').forEach(item => {
    item.classList.remove('spawnError')
  })
}

function validateForm(form) {
  let errors = [];
  for (let i = 0; i < form.length; i++) {
    if (!!!(form[i]['re'].test(form[i]['inputValue']))) {
      errors.push({
        inputName: form[i]['inputName'],
        reason: form[i]['inputValue'] == '' ? 'Please fill out this field' : form[i]['inputName'] == 'email' ? `${uppercaser(form[i]['inputName'])} type is invalid` : `${uppercaser(form[i]['inputName'])} is too short`,
      })
    }
  }
  displayErrors(errors);
  //console.log('This is from front-end', errors)
  return errors;
}

function displayErrors(errors) {
  if (errors) {
    if (errors.length) {
      errors.forEach(err => {
        bool = false;
        let errorMessage = document.querySelector(`.${err.inputName}`);
        errorMessage.childNodes[5].innerText = `${err.reason}`;
        errorMessage.classList.add('spawnError');
      });
    }
  }
}

// ajax
function ajaxRequest(method, url, data) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
    xhr.onload = function () {
      if (this.readyState === 4 && this.status === 200) {
        resolve(this.responseText);
      }
    };
    xhr.onerror = function (error) {
      reject(new ErrorHandler('Network error'));
    }
  })
};


// uppercaser

function uppercaser(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}


// display loader

function loadingAnimation(bool) {
  if(bool) {
    if(loader.classList.contains('off')) {
      loader.classList.remove('off');
      loader.classList.add('on');
    }
  } else {
    if(loader.classList.contains('on')) {
      loader.classList.remove('on');
      loader.classList.add('off');
    }
  }
}

// hide convert

function convertBtnVisibility(bool) {
  if(bool) {
    if(convertButton.classList.contains('convertOff')) {
      convertButton.classList.remove('convertOff');
      convertButton.classList.add('convertOn');
    }
  } else {
    if(convertButton.classList.contains('convertOn')) {
      convertButton.classList.remove('convertOn');
      convertButton.classList.add('convertOff');
    }
  }
}
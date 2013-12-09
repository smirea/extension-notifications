var FavIconCounter = {
  exportFormat: 'image/png',
  font: {
    size : 10,
    style: '',
    family: '"lucida grande", tahoma, verdana, arial, sans-serif',
    color: '#ffffff',
    background: '#F03D25'
  },
  background: {
    x: 3,
    y: 3,
    width: 14,
    height: 14
  },
  canvas: null,
  ctx: null,
  backgroundImage: null,

  /**
   * Resets the canvas and sets the background image.
   * @param  {Node} backgroundImage Optional.
   */
  setupCanvas: function (backgroundImage) {
    this.backgroundImage = backgroundImage || this.backgroundImage;
    if (!this.backgroundImage) {
      console.warn('[FavIconCounter.setupCanvas] No background image!');
    }
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.height = 16;
    this.canvas.width = 16;
    if (this.backgroundImage) {
      this.ctx.drawImage(
        this.backgroundImage,
        this.background.x,
        this.background.y,
        this.background.width,
        this.background.height
      );
    }
  },

  /**
   * Create an image element and async call setupCanvas(image);
   * @param  {String}   url
   * @param  {Function} callback Optional.
   */
  loadImage: function (url, callback) {
    var that = this;
    var img = document.createElement('img');
    img.onload = function () {
      that.setupCanvas(this);
      (callback || function () {})(this);
    };
    img.src = url;
  },

  /**
   * Create a favicon element with the current image in the canvas.
   * @return {Node}
   */
  makeFavIcon: function () {
    var link = document.createElement('link');
    link.rel = 'icon';
    link.type = this.exportFormat;
    link.href = this.canvas.toDataURL(this.exportFormat);
    return link;
  },

  /**
   * Sets the canvas text.
   * @param {Number} text
   */
  setText: function (text) {
    this.ctx.fillStyle = this.font.background;
    this.ctx.fillRect(0,
                      0,
                      text.toString().length > 1 ? 14 : 8,
                      this.font.size + 1
    );
    this.ctx.font = this.font.style + ' ' +
                    this.font.size + 'px ' +
                    this.font.family;
    this.ctx.fillStyle = this.font.color;
    this.ctx.fillText(text, 1, this.font.size - 1);
  },
};
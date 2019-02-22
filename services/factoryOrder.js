const BaseService = require('./base');
const FactoryOrderRepo = require('../repos/factoryOrder');
const LabelRepo = require('../repos/label');
const PdfPrinter = require('pdfmake');

class FactoryOrders extends BaseService {

  constructor() {
    super(FactoryOrderRepo);
  }

  async getListView(page = 1, order, desc) {
    let list = await this.repo.list(page, order, desc);
    if (list.length === 0) return [];
    list = FactoryOrders._addListStatus(list);
    list = FactoryOrders._convertDate(list);
    return list;
  }

  async getSchema() {
    let schema = await this._getSchema();
    schema.serial.alias = "Order";
    schema.ordered.alias = "Created";
    schema.masterCartons.alias = "Master Ctns.";
    schema.innerCartons.alias = "Inner Ctns.";
    schema.serial.explanation = "Factory order serial number.";
    schema.arrival.explanation = "Date order was received by warehouse.";
    schema.ordered.explanation = "Date order was created.";
    return schema;
  }

  async get(id) {
    let model = await this.repo.get(id);
    if (!model) return null;
    model = FactoryOrders._addListStatus(model);
    return model[0];
  }

  async add(serial, notes, order) {
    return this.repo.create(serial, notes, order);
  }

  async getDetails(id) {
    return this.repo.expand(id);
  }

  async stock(id) {
    return this.repo.stock(id);
  }

  static _addListStatus(list) {
    if (!Array.isArray(list)) {
      list = [list];
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i].arrival) list[i].state = 'eternal';
      else if (list[i].hidden) list[i].state = 'hidden';
      else list[i].state = 'used';
      delete list[i].hidden;
    }
    return list;
  }

  print(pdfDoc, callback) {
    // buffer the output
    let chunks = [];
    
    pdfDoc.on('data', (chunk) => {
      chunks.push(chunk);
    });

    pdfDoc.on('error', (err) => {
      console.log(err);
      return new Error('unknown');
    });

    pdfDoc.on('end', () => {
      const stream = Buffer.concat(chunks);
      callback(stream);
    });
    
    // close the stream
    pdfDoc.end();
  }

  async generateTemplate(id) {
    const order = await this.repo.get(id);
    let label = new LabelRepo();
    const url = await label.getActive();
    const INCH = 72;

    let template = new LabelTemplate(url, order.serial);

    for (let j = 0; j < order.masterCartons.length; j++) {
      const master = order.masterCartons[j];

      template.drawMaster(
        master.serial,
        master.size,
        master.color,
        order.ordered,
        0, 0
      );

      template.drawMaster(
        master.serial,
        master.size,
        master.color,
        order.ordered,
        INCH * 4, 0
      );

      template.drawSeparator(INCH * 2.1);
      let y = INCH * 2.2;

      for (let k = 0; k < master.innerCartons.length; k++) {
        const inner = master.innerCartons[k];

        /* Ran out of space in a page. */
        if (y >= INCH * 10) template.drawPageBreak();

        template.drawInner(
          inner.serial,
          master.sizeShort,
          master.colorShort,
          0, y
        );

        let x = INCH * 2;

        for (let l = 0; l < inner.items.length; l++) {
          const item = inner.items[l];
          template.drawUnit(
            item.serial, 
            master.sizeShort, 
            master.colorShort,
            x, y
          );
          x += INCH;

          /* End of line. */
          if (x >= INCH * 8) {
            x = INCH * 2;
            y += INCH * 0.9;
          }
        }

        template.drawSeparator(y + INCH * 0.1)
        y += INCH * 0.2;
      }

      /* Add new page if there are more master cartons. */
      if (j < order.masterCartons.length - 1) {
        template.drawPageBreak();
      }
    }
    return {
      document: template.output(),
      serial: template.serial
    };
  }

};

class LabelTemplate {
  
  constructor(qrUrl, serial) {
    const fontsDir = __dirname + '/../public/fonts';
    const fonts = {
      Roboto: {
        normal: `${fontsDir}/Roboto-Regular.ttf`,
        bold: `${fontsDir}/Roboto-Medium.ttf`,
        italics: `${fontsDir}/Roboto-Italic.ttf`,
        bolditalics: `${fontsDir}/Roboto-MediumItalic.ttf`
      }
    };

    const urlLength = qrUrl.prefix.length;
    const URL_MAXLEN = 42;
    if (qrUrl.style === 'path') {
      this.url = qrUrl.prefix;
      this.fill = ' '.repeat(URL_MAXLEN - urlLength);
    } else {
      this.url = `${qrUrl.prefix}?id=`;
      this.fill = ' '.repeat(URL_MAXLEN - urlLength - 4);
    }
    console.log(this.url);
    if (serial) this.serial = serial;
    this.printer = new PdfPrinter(fonts);
    this.canvas = new LabelCanvas();
    this.content = [];
    this.QR_INC = 21; // Pixel increments of QR size.
    this.MARGIN = 18; // 0.25-inch margin.
    this.INCH = 72; // Pixels per inch.
  }

  output() {
    let content = this.content;
    content.push(this.canvas.output());

    return this.printer.createPdfKitDocument({
      content,
      pageSize: 'LETTER',
      serial: this.serial
    });
  }

  drawUnit(serial, size, color, x, y) {
    this.canvas.drawUnit(x, y);
    this._addText(
      size.toUpperCase(), 
      x, 
      y - 1, 
      this.INCH * 0.5, 
      18,
      true
    );
    this._addText(
      color.toUpperCase(), 
      x, 
      y + this.INCH * 0.23, 
      this.INCH * 0.5, 
      7
    );
    this._addQr(
      serial, 
      x + this.INCH * 0.02, 
      y + this.INCH * 0.33, 
      1
    );
    this._addText(
      serial, 
      x,
      y + this.INCH * 0.78, 
      this.INCH * 0.5, 
      7
    );
    this._addLogo(
      x + this.INCH * 0.57 /*0.55*/,
      y + this.INCH * 0.05 /*0.3*/,
      this.INCH * 0.4
    );
  }

  drawInner(serial, size, color, x, y) {
    this.canvas.drawInner(x, y);
    this._addText(
      size.toUpperCase(), 
      x, 
      y + this.INCH * 0.05, 
      this.INCH, 
      24,
      true
    );
    this._addText(
      color.toUpperCase(), 
      x, 
      y + this.INCH * 0.4, 
      this.INCH, 
      14
    );
    this._addQr(
      serial, 
      x + this.INCH * 0.05, 
      y + this.INCH * 0.62, 
      3
    );
    this._addText(
      serial, 
      x,
      y + this.INCH * 1.53, 
      this.INCH, 
      14,
      true
    );
    this._addLogo(
      x + this.INCH * 1.15 /*1.1*/,
      y + this.INCH * 0.08 /*0.6*/,
      this.INCH * 0.8
    );
  }

  drawMaster(serial, size, color, date, x, y) {
    this.canvas.drawMaster(x, y);
    this._addQr(
      serial, 
      x + this.INCH * 0.07, 
      y + this.INCH * 0.07, 
      6
    );

    let textY = color.length > 7 ? 0.15 : 0.3;
    this._addText(
      `S/N: ${serial}`, 
      x + this.INCH * 2,
      y + this.INCH * textY, 
      this.INCH * 2, 
      16,
      true,
      'left'
    );

    textY += 0.3;
    this._addText(
      `Color: ${color.toUpperCase()}`, 
      x + this.INCH * 2, 
      y + this.INCH * textY, 
      this.INCH * 2, 
      16,
      true,
      'left'
    );

    textY += color.length > 7 ? 0.6 : 0.3;
    this._addText(
      `Size: ${size.toUpperCase()}`, 
      x + this.INCH * 2, 
      y + this.INCH * textY, 
      this.INCH * 2, 
      16,
      true,
      'left'
    );

    let dateFormatted = new Date(date).toDateString();
    dateFormatted = dateFormatted.split(' ');
    dateFormatted.shift();
    dateFormatted = dateFormatted.join(' ');

    textY += 0.3;
    this._addText(
      'Order Date:', 
      x + this.INCH * 2, 
      y + this.INCH * textY, 
      this.INCH * 2, 
      16,
      true,
      'left'
    );

    textY += 0.25;
    this._addText(
      dateFormatted, 
      x + this.INCH * 2, 
      y + this.INCH * textY, 
      this.INCH * 2, 
      16,
      true
    );
  }

  drawSeparator(y) {
    this.canvas.drawSeparator(y);
  }

  drawPageBreak() {
    /* Draw borders before page break. */
    this.content.push(this.canvas.output());
    
    /* Mark end of a page. */
    this.content.push({
      text: '',
      fontSize: 5,
      pageBreak: 'after',
      absolutePosition: { x: 0, y: this.INCH * 10.8 }
    });

    /* New borders go to new page. */
    this.canvas = new LabelCanvas();

    this.pages += 1;
  }

  _addQr(serial, x, y, size) {
    this.content.push({
      qr: this.url + serial + this.fill,
      eccLevel: 'M',
      fit: this._scale(size),
      absolutePosition: this._pos(x, y)
    });
  }

  _addText(text, x, y, width, fontSize, bold = false, align = "center") {
    this.content.push({
      table: {
        widths: [width],
        body: [
          [{ 
            text, fontSize, bold,
            border: [false, false, false, false],
            margin: [0, 0, 0, 0],
            alignment: align
          }]
        ]
      },
      absolutePosition: this._pos(x - 5, y - 3)
    });
  }

  _addLogo(x, y, width) {
    this.content.push({
      image: __dirname + '/../public/images/smokebuddy-logo-90.png',
      width,
      absolutePosition: this._pos(x, y)
    })
  }

  _p() { return this.PAGESIZE * this.pages; }

  _pos(x, y) {
    return { x: x + this.MARGIN, y: y + this.MARGIN };
  }

  _scale(size) { return (size + 1) * this.QR_INC; }

};

class LabelCanvas {
  
  constructor(x = 18, y = 18) {
    this.canvas = [];
    this.absolutePosition = { x, y };
    this.INCH = 72; // Pixels per inch
  }

  output() {
    return {
      canvas: this.canvas,
      absolutePosition: this.absolutePosition
    };
  }

  drawUnit(x, y) {
    this._addBoundary(
      x, y, 
      this.INCH, this.INCH * 0.9
    );
    this._addLine(
      x + this.INCH * 0.5, x + this.INCH * 0.5,
      y, y + this.INCH * 0.9
    );
  }

  drawInner(x, y) {
    this._addBoundary(
      x, y, 
      this.INCH * 2, this.INCH * 1.75
    );
    this._addLine(
      x + this.INCH, x + this.INCH, 
      y, y + this.INCH * 1.75
    );
  }

  drawMaster(x, y) {
    this._addBoundary(x, y, this.INCH * 4, this.INCH * 2);
  }

  drawSeparator(y) {
    this._addLine(
      0, this.INCH * 8,
      y, y
    );
    this.canvas[this.canvas.length - 1].dash = { length: 4 };
  }

  _addBoundary(x, y, w, h) {
    this.canvas.push({
      type: 'rect',
      x, y, w, h,
      r: 3,
      lineWidth: 1
    });
  }

  _addLine(x1, x2, y1, y2) {
    this.canvas.push({
      type: 'line',
      x1, y1, x2, y2,
      lineWidth: 1,
      lineCap: 'square'
    });
  }

}

module.exports = FactoryOrders;
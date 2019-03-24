const BaseService = require('./base');
const FactoryOrderRepo = require('../repos/factoryOrder');
const LabelRepo = require('../repos/label');
const PDFDocument = require('pdfkit');
const qr = require('qr-image');

class FactoryOrders extends BaseService {

  constructor() {
    super(FactoryOrderRepo);
  }

  async getListView(page = 1, order = false, desc = false, filter = {}) {
    if (filter.serial) {
      filter.serial = [filter.serial, filter.serial.toUpperCase()];
    }
    let list = await this._getListView(page, order, desc, filter);
    return this._addListStatus(list);
  }

  async getSchema() {
    let schema = await this._getSchema();

    /* Column names to show. */
    schema.serial.alias = "Order";
    schema.ordered.alias = "Created";
    schema.masterCartons.alias = "Master Ctns.";
    schema.innerCartons.alias = "Inner Ctns.";

    /* Explanations on mouse hovers. */
    schema.serial.explanation = "Factory order serial number.";
    schema.arrival.explanation = "Date order was received by warehouse.";
    schema.ordered.explanation = "Date order was created.";
    return schema;
  }

  async get(id) {
    let order = await this._get(id);
    return this._addListStatus(order);
  }

  async changeState(id) {
    const model = await this.get(id);
    return this._changeState(model, id);
  }

  /* order is [...{sku, master}]. */
  async add(serial, notes, order) {
    serial = serial.toUpperCase();
    return this.repo.create(serial, notes, order);
  }

  async getDetails(id) {
    return this.repo.expand(id);
  }

  async stock(id) {
    return this.repo.stock(id);
  }

  _addListStatus(list) {
    const inputIsArray = Array.isArray(list);
    if (!inputIsArray) {
      list = [list];
    }

    const busyList = this._getActiveEvents()

    for (let i = 0; i < list.length; i++) {
      if (list[i].serial in busyList) list[i].state = 'busy';
      else if (list[i].arrival) list[i].state = 'eternal';
      else if (list[i].hidden) list[i].state = 'hidden';
      else list[i].state = 'used';
      delete list[i].hidden;
    }

    if (!inputIsArray) list = list[0];
    return list;
  }

  /* Generate template specification with positions of each visual
     element. 
     writeCallback(doc, serial) -- 
        Callback function run at start of pdf stream to pipe to
        response. Inputs are the PDFDocument, and factory order
        serial.
     endCallback() --
        Callback function after pdf stream ends e.g. to end
        response.
  */
  async generateTemplate(id, writeCallback, endCallback) {
    /* Get factory order. */
    const order = await this.repo.getDepth(id);
    /* Get latest updated label url to use for the QR codes. */
    let label = new LabelRepo();
    const url = await label.getActive();

    /* Create pdf template. */
    let template = new TemplatePage(url);

    /* Run writeCallback function to pipe stream to response. */
    template.write(writeCallback, order.serial);

    /* Start new page for each master carton. */
    for (let j = 0; j < order.masterCartons.length; j++) {
      const master = order.masterCartons[j];
      template.build(master, order.ordered.split(' ')[0]);
    }
    /* End pdf stream and listen for event to run endCallback
       function. */
    template.end(endCallback);
  }
};

class TemplatePage {
  constructor(url, inch = 72) {
    /* Label url. */
    this.url = url;

    /* Pixels per inch. */
    this.INCH = inch;

    /* Document settings. 
       We want to manually specify pagebreaks, so
       autoFirstPage = false. */
    this.margin = 0.25*this.INCH;
    this.pageWidth = 8*this.INCH;
    this.pageHeight = 10.5*this.INCH;
    this.doc = new PDFDocument({ 
      autoFirstPage: false,
      size: 'letter',
      margin: this.margin
    });
  }

  /* Callback so controller can set response settings with serial
     as content-disposition filename. */
  write(callback, serial) {
    this.stream = callback(this.doc, serial);
  }

  /* Render template for a master carton. */
  build(masterCarton, date) {
    let label = new TemplateLabel(this.doc, this.url);

    /* Always start new page. */
    this.doc.addPage();
    let currentY = 0;

    /* Generate two master cartons on top. */
    for (let i = 0; i < 2; i++) {
      currentY = label.masterLabel(
        this.margin + 4*i*this.INCH,
        this.margin, {
          serial: masterCarton.serial,
          size: masterCarton.size,
          color: masterCarton.color,
          date: date
        }
      );
    }

    /* Generate each inner carton row. */
    const numInner = masterCarton.innerCartons.length;
    for (let i = 0; i < numInner; i++) {

      /* New page if not enough space for another inner carton. */
      if (currentY > this.pageHeight - 2*this.INCH) {
        this.doc.addPage();
        currentY = this.margin;
      }

      currentY = label.separator(currentY);
      const inner = masterCarton.innerCartons[i];
      label.innerLabel(
        this.margin,
        currentY, {
          serial: inner.serial,
          size: masterCarton.sizeShort,
          color: masterCarton.colorShort
        }
      );

      /* Generate each unit label. */
      const numUnit = inner.items.length;
      let nextY;
      for (let j = 0; j < numUnit; j++) {
        /* Only space for 6 labels per row. */
        if (j % 6 === 0) {
          currentY = nextY || currentY;
        }
        /* New page if not enough space for another row. */
        if (currentY > this.pageHeight - this.INCH) {
          this.doc.addPage();
          currentY = this.margin;
        }
        const currentX = ((j % 6) + 2)*this.INCH + this.margin;
        const item = inner.items[j];
        nextY = label.unitLabel(
          currentX, currentY, {
            serial: item.serial,
            size: masterCarton.sizeShort,
            color: masterCarton.colorShort
          }
        );
      }
      currentY = nextY;
    }
  }

  /* End pdf stream, then run callback function. */
  end(callback) {
    this.doc.end();
    this.stream.on('finished', () => {
      callback();
    });
  }
};

/* Functions for each type of label. */
class TemplateLabel {
  constructor(document, url, inch = 72) {
    this.doc = document;

    /* Parse url. Append ?id= if style is querystring. */
    let prefix = url.prefix;
    this.url = url.style === 'Path' ? prefix : `${prefix}?id=`;
    this.INCH = inch;
  }

  unitLabel(x, y, data) {
    let el = new TemplateElements(this.doc);
    el.border(x, y, this.INCH, 0.9*this.INCH);
    el.line(
      {x: x + 0.5*this.INCH, y: y}, 
      {x: x + 0.5*this.INCH, y: y + 0.9*this.INCH}
    );
    el.qrCode(this.url + data.serial, x + 3, y + 0.33*this.INCH, 42);
    el.logo(x + 0.57*this.INCH, y + 0.05*this.INCH, 0.4*this.INCH);
    el.textBold(data.size, 20, x, y + 0.03*this.INCH, 0.5*this.INCH);
    el.text(data.color, 6, x, y + 0.25*this.INCH, 0.5*this.INCH);
    el.serial(data.serial, 7, x, y + 0.74*this.INCH, 0.5*this.INCH);
    return y + 0.9*this.INCH;
  }

  innerLabel(x, y, data) {
    let el = new TemplateElements(this.doc);
    el.border(x, y, 2*this.INCH, 1.75*this.INCH);
    el.line(
      {x: x + this.INCH, y: y}, 
      {x: x + this.INCH, y: y + 1.75*this.INCH}
    );
    el.qrCode(this.url + data.serial, x + 3, y + 0.6*this.INCH, 48, 2);
    el.logo(x + 1.15*this.INCH, y + 0.08*this.INCH, 0.8*this.INCH);
    el.textBold(data.size, 28, x, y + 0.05*this.INCH, this.INCH);
    el.text(data.color, 13, x, y + 0.4*this.INCH, this.INCH);
    el.serial(data.serial, 14, x, y + 1.5*this.INCH, this.INCH);
    return y + 1.75*this.INCH;
  }

  masterLabel(x, y, data) {
    let el = new TemplateElements(this.doc);
    el.border(x, y, 4*this.INCH, 2*this.INCH);

    el.qrCode(this.url + data.serial, 
      x + 0.07*this.INCH, y + 0.07*this.INCH, 48, 4);

    const textX = 2*this.INCH;
    const width = textX;
    let textY = 0.35*this.INCH;
    if (data.color.length > 7) textY -= 0.15*this.INCH;
    el.textBold(`S/N: ${data.serial}`, 16, 
      x + textX, y + textY, width, 'left');

    textY += 0.3*this.INCH;
    el.text(`Color: ${data.color}`, 16, 
      x + textX, y + textY, width, 'left');

    textY += 0.3*this.INCH;
    if (data.color.length > 7) textY += 0.3*this.INCH;
    el.text(`Size: ${data.serial}`, 16, 
      x + textX, y + textY, width, 'left');

    textY += 0.3*this.INCH;
    el.text(`Order Date:`, 16, x + textX, y + textY, width, 'left');

    textY += 0.25*this.INCH;
    el.text(data.date, 16, x + textX, y + textY, width);
    return y + 2*this.INCH;
  }

  separator(y) {
    this.doc.lineCap('round')
            .moveTo(0.25*this.INCH, y + 0.1*this.INCH)
            .lineTo(8.25*this.INCH, y + 0.1*this.INCH)
            .lineWidth(1)
            .dash(5, {space: 10})
            .stroke();
    return y + 0.2*this.INCH;
  }
};

/* Functions for each element necessary for template. */
class TemplateElements {
  constructor(document) {
    this.doc = document;
  }

  border(x, y, width, height) {
    this.doc.roundedRect(x, y, width, height, 3)
        .undash()
        .lineWidth(1)
        .stroke();
  }

  line(pos1, pos2) {
    this.doc.lineCap('square')
        .undash()
        .moveTo(pos1.x, pos1.y)
        .lineTo(pos2.x, pos2.y)
        .lineWidth(1)
        .stroke();
  }

  qrCode(url, x, y, maxLength, scale = 1) {
    const urlFill = url + ' '.repeat(maxLength - url.length);
    const qr_png = qr.imageSync(urlFill, { margin: 0, size: scale });
    const qrcode = "data:image/png;base64," + qr_png.toString('base64');
    this.doc.image(qrcode, x, y, { scale: 1 });
  }

  logo(x, y, width) {
    const LOGO = __dirname + '/../public/images/smokebuddy-logo-90.png';
    this.doc.image(LOGO, x, y, { width });
  }

  text(text, fontSize, x, y, width, align = 'center') {
    this.doc.font('Helvetica', fontSize)
            .text(text, x, y, { width, align });
  }

  textBold(text, fontSize, x, y, width, align = 'center') {
    this.doc.font('Helvetica-Bold', fontSize)
            .text(text, x, y, { width, align });
  }

  serial(id, fontSize, x, y, width, align = 'center') {
    const ID_FONT = __dirname + '/../public/fonts/CrimsonText-SemiBold.ttf';
    this.doc.font(ID_FONT, fontSize)
            .text(id, x, y, { width, align });
  }
};

module.exports = FactoryOrders;
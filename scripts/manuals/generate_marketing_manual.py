from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth

OUT = Path(__file__).resolve().parents[2] / "documentation" / "user-manuals" / "CEYPETCO-marketing-user-manual.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)
W, H = A4
NAVY = colors.HexColor('#062e3b')
RED = colors.HexColor('#d71920')
INK = colors.HexColor('#17363e')
MUTED = colors.HexColor('#64777c')
PALE = colors.HexColor('#f2f6f7')
LINE = colors.HexColor('#dce5e7')
GREEN = colors.HexColor('#16845b')

def wrap(text, font, size, width):
    lines, line = [], ''
    for word in text.split():
        test = (line + ' ' + word).strip()
        if stringWidth(test, font, size) <= width:
            line = test
        else:
            if line: lines.append(line)
            line = word
    if line: lines.append(line)
    return lines

def para(c, text, x, y, width, size=9.5, leading=14, color=INK, font='Helvetica'):
    c.setFillColor(color); c.setFont(font, size)
    for line in wrap(text, font, size, width):
        c.drawString(x, y, line); y -= leading
    return y

def header(c, page, title):
    c.setFillColor(NAVY); c.rect(0, H-44, W, 44, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 9); c.drawString(38, H-27, 'CEYPETCO  /  MARKETING USER GUIDE')
    c.setFillColor(colors.HexColor('#c6d7da')); c.setFont('Helvetica', 8); c.drawRightString(W-38, H-27, title)
    c.setStrokeColor(LINE); c.line(38, 34, W-38, 34)
    c.setFillColor(MUTED); c.setFont('Helvetica', 7.5); c.drawString(38, 21, 'Internal content manager quick guide')
    c.drawRightString(W-38, 21, str(page))

def title(c, text, y):
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 18); c.drawString(42, y, text)
    c.setFillColor(RED); c.roundRect(42, y-13, 42, 3, 1.5, fill=1, stroke=0)

def bullets(c, rows, x, y, width, size=9.5, gap=11):
    for label, body in rows:
        c.setFillColor(RED); c.circle(x+3, y+2, 2.4, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont('Helvetica-Bold', size); c.drawString(x+13, y, label)
        y -= 14
        y = para(c, body, x+13, y, width-13, size, 13, MUTED)
        y -= gap
    return y

def browser(c, x, y, w, h, address='ceypetco.gov.lk/admin'):
    c.setFillColor(colors.white); c.setStrokeColor(LINE); c.roundRect(x, y, w, h, 8, fill=1, stroke=1)
    c.setFillColor(PALE); c.roundRect(x, y+h-24, w, 24, 8, fill=1, stroke=0); c.rect(x, y+h-24, w, 8, fill=1, stroke=0)
    for i, col in enumerate([RED, colors.HexColor('#e7b94c'), GREEN]):
        c.setFillColor(col); c.circle(x+13+i*11, y+h-12, 3, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont('Helvetica', 7); c.drawString(x+52, y+h-15, address)

def sidebar(c, x, y, w, h, active='Dashboard'):
    c.setFillColor(NAVY); c.rect(x, y, w, h, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 8); c.drawString(x+10, y+h-17, 'CEYPETCO')
    c.setFillColor(colors.HexColor('#9fb8be')); c.setFont('Helvetica-Bold', 5.5); c.drawString(x+10, y+h-27, 'CONTENT MANAGER')
    labels=['Dashboard','Fuel Prices','Historical Prices','Product Specifications']
    yy=y+h-54
    for label in labels:
        if label == active:
            c.setFillColor(RED); c.roundRect(x+5, yy-6, w-10, 20, 4, fill=1, stroke=0)
        c.setFillColor(colors.white if label == active else colors.HexColor('#c6d7da'))
        c.setFont('Helvetica-Bold' if label == active else 'Helvetica', 6.5); c.drawString(x+12, yy, label)
        yy -= 25
    c.setStrokeColor(colors.HexColor('#244c56')); c.line(x+7, y+23, x+w-7, y+23)
    c.setFillColor(colors.HexColor('#9fb8be')); c.setFont('Helvetica', 5.5); c.drawString(x+9, y+11, 'Signed in as Marketing User')

def dashboard_mock(c, x, y, w, h):
    browser(c, x, y, w, h)
    sx, sy, sw, sh = x+5, y+5, w-10, h-29
    sidew=sw*.27; sidebar(c, sx, sy, sidew, sh)
    mx=sx+sidew+12; top=sy+sh-20; mw=sw-sidew-22
    c.setFillColor(MUTED); c.setFont('Helvetica', 6); c.drawString(mx, top, 'ALLOWED OPERATIONS')
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 12); c.drawString(mx, top-19, 'Welcome, Marketing User')
    c.setFillColor(MUTED); c.setFont('Helvetica', 7); c.drawString(mx, top-32, 'Manage your assigned marketing content.')
    for i, label in enumerate(['Fuel Prices', 'Historical Prices', 'Product Specifications']):
        yy=top-65-i*39
        c.setFillColor(colors.white); c.setStrokeColor(LINE); c.roundRect(mx, yy-17, mw, 30, 5, fill=1, stroke=1)
        c.setFillColor(INK); c.setFont('Helvetica-Bold', 7.5); c.drawString(mx+9, yy-1, label)
        c.setFillColor(RED); c.roundRect(mx+mw-46, yy-10, 38, 15, 3, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 5.5); c.drawCentredString(mx+mw-27, yy-4, 'Open')

def price_mock(c, x, y, w, h):
    browser(c, x, y, w, h, 'ceypetco.gov.lk/admin/fuel-prices')
    sx, sy, sw, sh = x+5, y+5, w-10, h-29
    sidew=sw*.25; sidebar(c, sx, sy, sidew, sh, 'Fuel Prices')
    mx=sx+sidew+11; top=sy+sh-17; mw=sw-sidew-19
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 11); c.drawString(mx, top, 'Fuel Prices')
    c.setFillColor(MUTED); c.setFont('Helvetica', 6); c.drawString(mx, top-12, 'Manage current fuel and product prices.')
    c.setFillColor(RED); c.roundRect(mx+mw-46, top-4, 45, 17, 3, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 5.5); c.drawCentredString(mx+mw-23, top+2, '+ Add New')
    c.setFillColor(PALE); c.roundRect(mx, top-40, mw*.59, 18, 3, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont('Helvetica', 6); c.drawString(mx+8, top-34, 'Search products...')
    table_y=top-58; c.setFillColor(PALE); c.rect(mx, table_y-18, mw, 18, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont('Helvetica-Bold', 5.4)
    for xx, label in [(mx+6,'PRODUCT'),(mx+mw*.4,'PRICE'),(mx+mw*.65,'EFFECTIVE DATE'),(mx+mw-34,'STATUS')]: c.drawString(xx, table_y-12, label)
    rows=[('Petrol 92','LKR 293.00','Current','Active'),('Petrol 95','LKR 371.00','Current','Active'),('Auto Diesel','LKR 283.00','Current','Active')]
    for i,(a,b,d,e) in enumerate(rows):
        yy=table_y-36-i*22; c.setStrokeColor(LINE); c.line(mx, yy-5, mx+mw, yy-5)
        c.setFillColor(INK); c.setFont('Helvetica',5.6); c.drawString(mx+6,yy,a); c.drawString(mx+mw*.4,yy,b); c.drawString(mx+mw*.65,yy,d)
        c.setFillColor(GREEN); c.setFont('Helvetica-Bold',5.2); c.drawString(mx+mw-34,yy,e)
        c.setFillColor(RED); c.drawRightString(mx+mw-5,yy,'Edit')

def field_box(c, x, y, w, label, value, height=23):
    c.setFillColor(MUTED); c.setFont('Helvetica-Bold', 7); c.drawString(x, y+height+4, label)
    c.setFillColor(colors.white); c.setStrokeColor(LINE); c.roundRect(x, y, w, height, 4, fill=1, stroke=1)
    c.setFillColor(INK); c.setFont('Helvetica', 8); c.drawString(x+8, y+8, value)

def cover(c):
    c.setFillColor(NAVY); c.rect(0,0,W,H,fill=1,stroke=0); c.setFillColor(RED); c.rect(0,0,12,H,fill=1,stroke=0)
    c.setFillColor(colors.HexColor('#164956')); c.circle(W+5,H-35,160,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold',14); c.drawString(48,H-70,'CEYPETCO')
    c.setFillColor(colors.HexColor('#ffc6c6')); c.setFont('Helvetica-Bold',9); c.drawString(48,H-133,'MARKETING USER')
    c.setFont('Helvetica-Bold',30); c.drawString(48,H-181,'Marketing User')
    c.drawString(48,H-218,'Manual')
    para(c,'A simple visual guide to updating fuel prices and the product specification PDF in the CEYPETCO Content Manager.',48,H-260,W-110,13,20,colors.HexColor('#d7e4e7'))
    c.setFillColor(colors.HexColor('#9fb8be')); c.setFont('Helvetica-Bold',8); c.drawString(48,H-353,'OPEN THE CONTENT MANAGER')
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold',12); c.drawString(48,H-376,'https://ceypetco.gov.lk/login')
    c.setFillColor(RED); c.roundRect(48,H-415,62,4,2,fill=1,stroke=0)
    c.setFillColor(colors.HexColor('#9fb8be')); c.setFont('Helvetica-Bold',8); c.drawString(48,H-458,'THIS GUIDE COVERS')
    for i,t in enumerate(['Sign in and find your tools','Manage current and historical prices','Upload product specification PDFs','Save changes and check the public site']):
        yy=H-486-i*25; c.setFillColor(colors.HexColor('#ee5a60')); c.circle(54,yy+3,3,fill=1,stroke=0)
        c.setFillColor(colors.white); c.setFont('Helvetica',10); c.drawString(68,yy,t)
    c.setFillColor(colors.HexColor('#9fb8be')); c.setFont('Helvetica',8); c.drawString(48,42,'CEYLON PETROLEUM CORPORATION  •  OCTOBER 2026')
    c.showPage()

def page_signin(c):
    header(c,2,'SIGN IN & DASHBOARD'); title(c,'1. Sign in and open your tools',H-77)
    para(c,'Use the account email and password provided by your administrator. If your account is blocked or you reach the failed-attempt limit, ask an administrator to unlock it.',42,H-111,W-84,9.5,14)
    dashboard_mock(c,42,H-370,W-84,220)
    c.setFillColor(RED); c.setFont('Helvetica-Bold',8); c.drawString(52,H-390,'1'); c.setFillColor(INK); c.setFont('Helvetica-Bold',8); c.drawString(66,H-390,'Choose Fuel Prices or Product Specifications from the dashboard card or sidebar.')
    title(c,'What you can manage',H-436)
    bullets(c,[('Fuel Prices','Add new price records or edit existing product prices, effective dates, effective times and status.'),('Historical Prices','Create, view, edit and delete historical fuel price and bitumen revision records.'),('Product Specifications','Update the document title and description, upload the specification PDF, and save its publishing status.'),('Dashboard and sign out','The dashboard is your starting point. Use Log out at the bottom of the sidebar when finished.')],48,H-468,W-100)
    c.showPage()

def page_prices(c):
    header(c,3,'FUEL PRICES'); title(c,'2. Add or update a fuel price',H-77)
    para(c,'Open Fuel Prices. Search by product name to find a record. Choose Edit to change a listed record, or Add New to create one.',42,H-111,W-84)
    price_mock(c,42,H-373,W-84,225)
    c.setFillColor(MUTED); c.setFont('Helvetica-Oblique',7); c.drawString(48,H-389,'Illustration of the Fuel Prices list. Values shown are examples, not live prices.')
    title(c,'Enter the price details',H-425)
    rows=[('Product Name','Type the official product name.'),('Category','Choose the matching category, such as White Oil, Black Oil, Lubricants or Aviation Fuel.'),('Type','Choose fuel, lubricant, aviation or other.'),('Price (LKR)','Enter the approved amount. Check digits and decimal places carefully.'),('Unit','Confirm the unit shown for the price.'),('Effective Date','Choose the date this price takes effect.'),('Effective Time','Defaults to 00:00 (12:00 AM, midnight). Change it when the approved price takes effect at another time. The public price card shows the date and time.'),('Status','Set Active when it should be used; choose Inactive when it should not be active.')]
    yy=H-453
    for label,body in rows:
        c.setFillColor(INK); c.setFont('Helvetica-Bold',8); c.drawString(48,yy,label)
        yy=para(c,body,154,yy,W-200,8.3,11,MUTED)-5
    c.setFillColor(PALE); c.roundRect(42,48,W-84,53,7,fill=1,stroke=0)
    c.setFillColor(RED); c.setFont('Helvetica-Bold',8); c.drawString(54,82,'CHECK BEFORE SAVING')
    para(c,'Verify product, category, price, effective date and status against the approved price instruction. Use Create for a new record or Update for an edited record.',54,67,W-108,8.2,11)
    c.showPage()

def history_mock(c, x, y, w, h):
    browser(c,x,y,w,h,'ceypetco.gov.lk/admin/historical-prices')
    sx,sy,sw,sh=x+5,y+5,w-10,h-29; sidew=sw*.25
    sidebar(c,sx,sy,sidew,sh,'Historical Prices')
    mx=sx+sidew+11; top=sy+sh-18; mw=sw-sidew-19
    c.setFillColor(INK); c.setFont('Helvetica-Bold',10); c.drawString(mx,top,'Historical Prices')
    c.setFillColor(MUTED); c.setFont('Helvetica',5.8); c.drawString(mx,top-12,'Manage fuel and bitumen price archive records.')
    c.setFillColor(RED); c.roundRect(mx+mw-51,top-4,50,16,3,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold',5.5); c.drawCentredString(mx+mw-26,top+2,'+ Add record')
    for i,(label,selected) in enumerate([('Fuel prices',True),('Bitumen revisions',False)]):
        xx=mx+i*66; c.setFillColor(NAVY if selected else PALE); c.roundRect(xx,top-39,63,18,3,fill=1,stroke=0)
        c.setFillColor(colors.white if selected else MUTED); c.setFont('Helvetica-Bold',5); c.drawCentredString(xx+31,top-32,label)
    table_y=top-53; c.setFillColor(PALE); c.rect(mx,table_y-18,mw,18,fill=1,stroke=0)
    c.setFillColor(MUTED); c.setFont('Helvetica-Bold',5.2); c.drawString(mx+6,table_y-12,'DATE'); c.drawString(mx+mw*.32,table_y-12,'PUBLISHED VALUES'); c.drawString(mx+mw*.8,table_y-12,'STATUS'); c.drawRightString(mx+mw-5,table_y-12,'ACTIONS')
    for i,(date,values) in enumerate([('01.03.1990','LP 95: 22 · LP 92: 20 · LAD: 9.6'),('01.01.1991','LP 95: 32.5 · LP 92: 30 · LAD: 11')]):
        yy=table_y-36-i*23; c.setStrokeColor(LINE); c.line(mx,yy-5,mx+mw,yy-5)
        c.setFillColor(INK); c.setFont('Helvetica',5.6); c.drawString(mx+6,yy,date); c.drawString(mx+mw*.32,yy,values)
        c.setFillColor(GREEN); c.setFont('Helvetica-Bold',5); c.drawString(mx+mw*.8,yy,'active')
        c.setFillColor(RED); c.setFont('Helvetica-Bold',5); c.drawRightString(mx+mw-5,yy,'Edit  Delete')

def page_history(c):
    header(c,4,'HISTORICAL PRICES'); title(c,'3. Manage historical prices',H-77)
    para(c,'Open Historical Prices from the dashboard or sidebar. Choose Fuel prices or Bitumen revisions to work in the correct archive. Search by date and press Enter to filter records.',42,H-111,W-84)
    history_mock(c,42,H-355,W-84,205)
    c.setFillColor(MUTED); c.setFont('Helvetica-Oblique',7); c.drawString(48,H-371,'Illustration only. Example archive values are not live data.')
    title(c,'Create or edit an archive record',H-405)
    bullets(c,[('Choose Add record or Edit','Add record creates an entry. Use Edit beside an existing date to correct that record.'),('Select the archive type','Choose Fuel prices or Bitumen revisions. Changing the type changes the fields shown.'),('Enter the published date','Fuel date format: DD.MM.YYYY, optionally with a time in parentheses. Bitumen date format: YYYY.MM.DD or YYYY.'),('Enter the values as published','Fill the fields shown. Leave a value blank if it was not provided. Add an optional note when useful.'),('Set visibility and save','Published/active records appear in the public archive. Hidden/inactive records do not. Click Save record.')],48,H-437,W-100,8.8,7)
    c.setFillColor(PALE); c.roundRect(42,49,W-84,48,7,fill=1,stroke=0)
    c.setFillColor(RED); c.setFont('Helvetica-Bold',8); c.drawString(54,79,'DELETE CAREFULLY')
    para(c,'Delete permanently removes the selected row from the archive. Confirm the date before you click Delete.',54,64,W-108,8.2,11)
    c.showPage()

def page_specs(c):
    header(c,5,'PRODUCT SPECIFICATIONS'); title(c,'4. Update the product specification PDF',H-77)
    para(c,'Open Product Specifications from the dashboard or sidebar. This screen controls the PDF and text shown on the public Product Specifications page.',42,H-111,W-84)
    x,y,w,h=42,H-373,W-84,222; browser(c,x,y,w,h,'ceypetco.gov.lk/admin/product-specification')
    sx,sy=x+5,y+5; sidew=(w-10)*.25; sidebar(c,sx,sy,sidew,h-29,'Product Specifications')
    mx=sx+sidew+12; mw=w-sidew-28; top=sy+h-48
    c.setFillColor(INK); c.setFont('Helvetica-Bold',10); c.drawString(mx,top,'Product Specifications')
    field_box(c,mx,top-46,mw*.58,'DOCUMENT TITLE','Petroleum product specifications',19)
    field_box(c,mx+mw*.62,top-46,mw*.38,'PUBLISHING STATUS','Published  v',19)
    c.setFillColor(MUTED); c.setFont('Helvetica-Bold',6.5); c.drawString(mx,top-67,'DESCRIPTION')
    c.setFillColor(colors.white); c.setStrokeColor(LINE); c.roundRect(mx,top-104,mw,30,4,fill=1,stroke=1)
    c.setFillColor(INK); c.setFont('Helvetica',6.5); c.drawString(mx+7,top-86,'Official quality requirements and technical data...')
    c.setFillColor(MUTED); c.setFont('Helvetica-Bold',6.5); c.drawString(mx,top-120,'SPECIFICATION PDF')
    c.setFillColor(PALE); c.roundRect(mx,top-166,mw,38,5,fill=1,stroke=0)
    c.setFillColor(NAVY); c.roundRect(mx+8,top-152,52,18,3,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold',6); c.drawCentredString(mx+34,top-145,'Upload PDF')
    c.setFillColor(RED); c.setFont('Helvetica-Bold',6); c.drawString(mx+68,top-145,'View current PDF')
    c.setFillColor(RED); c.roundRect(mx+mw-77,sy+13,77,20,4,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold',6); c.drawCentredString(mx+mw-38,sy+20,'Save changes')
    title(c,'Follow these steps',H-410)
    bullets(c,[('1. Check the title and description','Update the document title and short description if the approved content has changed.'),('2. Upload the approved PDF','Choose Upload PDF and select the correct PDF file. Wait for the upload confirmation. Use View current PDF to check the document.'),('3. Choose the status','Published makes the specification available on the public page. Draft keeps it unpublished.'),('4. Save changes','Click Save changes and wait for the success message. Uploading alone does not save or publish the change.')],48,H-442,W-100,9,8)
    c.setFillColor(PALE); c.roundRect(42,48,W-84,42,7,fill=1,stroke=0)
    c.setFillColor(RED); c.setFont('Helvetica-Bold',8); c.drawString(54,72,'FILE TIP')
    para(c,'Upload a PDF only. Check that it opens and is the approved, current version before saving.',54,58,W-108,8.3,11)
    c.showPage()

def page_finish(c):
    header(c,6,'REVIEW & HELP'); title(c,'5. Finish safely',H-77)
    bullets(c,[('Check the public result','After saving a current price, historical record or specification, open the public page and confirm the displayed information.'),('Correct a mistake','Return to the relevant screen, search for the record, choose Edit, correct it and save. For an incorrect published price, alert the approving manager promptly.'),('Sign out','Choose Log out at the bottom of the sidebar, especially when using a shared computer.'),('Need access or see an error?','Contact your CEYPETCO administrator. Include the page name, date/product, what you were doing and the exact error message. Never send your password.')],48,H-111,W-96,10,15)
    c.setFillColor(PALE); c.roundRect(42,259,W-84,135,10,fill=1,stroke=0)
    c.setFillColor(INK); c.setFont('Helvetica-Bold',12); c.drawString(58,367,'Quick checklist')
    checks=['Use approved price, effective date and time.','Check category, type, status and archive date.','Upload the correct PDF and wait for confirmation.','Save changes and verify the public page.','Delete archive rows only after checking the date.']
    yy=342
    for item in checks:
        c.setStrokeColor(GREEN); c.roundRect(59,yy-1,9,9,2,fill=0,stroke=1)
        c.setFillColor(INK); c.setFont('Helvetica',9); c.drawString(76,yy,item); yy-=22
    c.setFillColor(NAVY); c.roundRect(42,139,W-84,78,10,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont('Helvetica-Bold',11); c.drawString(58,190,'Your role keeps public information accurate.')
    para(c,'Make changes only from approved source information. If the price, product, PDF or effective date is unclear, confirm it with your manager before publishing.',58,169,W-116,9,14,colors.HexColor('#d7e4e7'))
    c.setFillColor(MUTED); c.setFont('Helvetica',8); c.drawString(42,90,'CEYPETCO Content Manager  •  Marketing User Manual')
    c.showPage()

def main():
    c=canvas.Canvas(str(OUT),pagesize=A4)
    c.setTitle('CEYPETCO Marketing User Manual')
    c.setAuthor('Ceylon Petroleum Corporation')
    cover(c); page_signin(c); page_prices(c); page_history(c); page_specs(c); page_finish(c)
    c.save()
    print(OUT)

if __name__ == '__main__': main()

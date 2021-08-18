from market import app
from flask import render_template, redirect, url_for, flash, request,session
#from flask_session import Session
from market.models import Item, User
from market.forms import RegisterForm, LoginForm, PurchaseItemForm
from market import db
from flask_login import login_user, logout_user, login_required, current_user
from email_validator import validate_email, EmailNotValidError
import time
import logging
import datetime
import json
import sqlite3
from flask import g
import mysql.connector

logging.basicConfig(filename='record.log', level=logging.DEBUG,
                    format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')


def connect_to_database():
    try:
        conn = mysql.connector.connect(
            host="trading.cpn3xlmmzatc.us-east-2.rds.amazonaws.com",
            db='trading',
            user="admin",
            password="MohitBhaiya$123",
            connection_timeout=60
        )
        return conn
        app.logger.info("New Connection Made to Database")
    except Exception as e:
        app.logger.error(e, exc_info=True)
        pass

def myconverter(o):
    if isinstance(o, datetime.date):
        return o.__str__()

def get_db():
    db = getattr(g, '_database', None)
    print ("DB_VALUE",db)
    if db is None:
        g._database = connect_to_database()
        db = g._database
    return db

def phone_validate(phone):
    validate=False
    if len(phone) == 10:
        validate = True
        print("PHONE LENGHT OKAY ")
    try:
        phone = int(phone)
        print("PHONE VALUE OKAY ")
    except Exception as e:
        print(e)
        validate = False
        pass
    return validate


def guest_validate(email,phone):
    validation_status = [False,False]
    try:
        print("entered email :",email)
        email_valid = validate_email(email)
        email = email_valid.email
        validation_status[0] = True
        email_msg = ""
    except EmailNotValidError as e:
        validation_status[0] = False
        email_msg = e
        pass

    if phone_validate(phone):
        validation_status[1]= True
        phone_msg = ""
    else:
        phone_msg = " Phone Number Not Valid "

    if (False in validation_status):
        return False,str(email_msg)+phone_msg
    else:
        return True,str(email_msg)+phone_msg


@app.teardown_appcontext
def teardown_db(exception):
    db = getattr(g, '_database', None)
    print("inside_tear_down db value", db)
    if db is not None:
        print("inside_tear_down db not null ")
        #db.close()


@app.route('/',methods=['GET', 'POST'])
@app.route('/home',methods=['GET', 'POST'])
def home_page():
    #try:
        ip = request.remote_addr
        referrer = request.referrer
        if request.method == 'GET':
            app.logger.info("LandedHome:: ip:%s referrer:%s"%(ip,referrer))
            return render_template('home.html')
        if request.method == 'POST':
            print("***************posting***************************")
            guest_email = request.form['guestInputEmail']
            guest_phone = request.form['guestInputPhone']
            res= guest_validate(guest_email,guest_phone)
            if res[0]:
                app.logger.info("SignedGuestSuccess:: ip:%s referrer:%s guest_email:%s guest_phone:%s" % (ip, referrer,guest_email,guest_phone))
                session['guest_email'] = guest_email
                session['_id'] = guest_email+str(guest_phone)
                app.logger.info("SessionCreated:: %s"%guest_email+str(guest_phone))
                return redirect(url_for('dashboard_page'))
            else:
                app.logger.info("SignedGuestFailed:: ip:%s referrer:%s guest_email:%s guest_phone:%s" % (ip, referrer, guest_email, guest_phone))
                return render_template('home.html', msg=res[1])
    # except Exception as e:
    #     app.logger.error(e, exc_info=True)
    #     pass



@app.route('/dashboard',methods=['GET','POST'])
def dashboard_page():
    # try:
        app.logger.info("DashboardLanded:: SessionID: %s"%session['_id'])
        if session.get('guest_email'):
            if request.args.get('period'):
                period = request.args.get('period')
            else:
                period = 15

            if request.method == "GET":
                app.logger.info("DataRequested:: SessionID: %s Period:%s" %(session['_id'],str(period)))
                cur = get_db().cursor(dictionary=True)
                query="select * from mbdcmart.website_data_%s order by avg_rise desc ,today_rise_percentage desc"%str(period)
                app.logger.info("QueryFired:: SessionID: %s Query:%s" % (session['_id'], query))
                cur.execute(query)
                data = cur.fetchall()
                app.logger.info("DataReceived:: SessionID: %s Query:%s" % (session['_id'], query))

                query = "select * from trading.all_trade_consolidated where trade_date >= CURDATE() - INTERVAL %s day"%str(period)
                app.logger.info("QueryFired:: SessionID: %s Query:%s" % (session['_id'], query))
                cur.execute(query)
                all_data = cur.fetchall()
                all_data = json.dumps(all_data,default=myconverter)
                app.logger.info("DataReceived:: SessionID: %s Query:%s" % (session['_id'], query))
                return render_template('dashboard.html',data=json.dumps(data),all_data=all_data, current_page_no=1,max_lenght=1000,period=period)
        else:
            return render_template('home.html', msg='** Enter your Details to visit dashboard')
    # except Exception as e:
    #     app.logger.error(e, exc_info=True)
    #     pass



# @app.route('/market', methods=['GET', 'POST'])
# @login_required
# def market_page():
#     purchase_form = PurchaseItemForm()
#     if request.method == "POST":
#         purchased_item = request.form.get('purchased_item')
#         p_item_object = Item.query.filter_by(name=purchased_item).first()
#         if p_item_object:
#             if current_user.can_purchase(p_item_object):
#                 p_item_object.buy(current_user)
#                 flash(f"Congratulations! You purchased {p_item_object.name} for {p_item_object.price}$", category='success')
#             else:
#                 flash(f"Unfortunately, you don't have enough money to purchase {p_item_object.name}!", category='danger')
#
#         return redirect(url_for('market_page'))
#
#     if request.method == "GET":
#         items = Item.query.filter_by(owner=None)
#         return render_template('market.html', items=items, purchase_form=purchase_form)
#
# @app.route('/register', methods=['GET', 'POST'])
# def register_page():
#     form = RegisterForm()
#     if form.validate_on_submit():
#         user_to_create = User(username=form.username.data,
#                               email_address=form.email_address.data,
#                               password=form.password1.data)
#         db.session.add(user_to_create)
#         db.session.commit()
#         login_user(user_to_create)
#         flash(f"Account created successfully! You are now logged in as {user_to_create.username}", category='success')
#         return redirect(url_for('market_page'))
#     if form.errors != {}: #If there are not errors from the validations
#         for err_msg in form.errors.values():
#             flash(f'There was an error with creating a user: {err_msg}', category='danger')
#
#     return render_template('register.html', form=form)

# @app.route('/login', methods=['GET', 'POST'])
# def login_page():
#     form = LoginForm()
#     if form.validate_on_submit():
#         attempted_user = User.query.filter_by(username=form.username.data).first()
#         if attempted_user and attempted_user.check_password_correction(
#                 attempted_password=form.password.data
#         ):
#             login_user(attempted_user)
#             flash(f'Success! You are logged in as: {attempted_user.username}', category='success')
#             return redirect(url_for('market_page'))
#         else:
#             flash('Username and password are not match! Please try again', category='danger')
#
#     return render_template('login.html', form=form)
#
# @app.route('/logout')
# def logout_page():
#     logout_user()
#     flash("You have been logged out!", category='info')
#     return redirect(url_for("home_page"))

@app.route('/favicon.ico')
def hello():
    return redirect(url_for('static', filename='favicon.ico'), code=302)











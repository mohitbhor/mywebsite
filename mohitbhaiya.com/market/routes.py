from market import app
from flask import render_template, redirect, url_for, flash, request
from market.models import Item, User
from market.forms import RegisterForm, LoginForm, PurchaseItemForm
from market import db
from flask_login import login_user, logout_user, login_required, current_user
import time
import datetime
import json
import sqlite3
from flask import g
import mysql.connector


def connect_to_database():
    conn = mysql.connector.connect(
      host="localhost",
      db='trading',
      user="root",
      password="admin",
      connection_timeout = 60,
      raise_on_warnings=True
    )
    print("***NEW CONNECTION **")
    return conn

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

@app.teardown_appcontext
def teardown_db(exception):
    db = getattr(g, '_database', None)
    print("inside_tear_down db value", db)
    if db is not None:
        print("inside_tear_down db not null ")
        #db.close()


@app.route('/')
@app.route('/home')
def home_page():
    return render_template('home.html')


@app.route('/dashboard',methods=['GET','POST'])
def dashboard_page():
    if request.args.get('period'):
        period = request.args.get('period')
    else:
        period = 15
    print("**** period ***",period)
    if request.method == "GET":
        cur = get_db().cursor(dictionary=True)
        #cur.execute("SET SESSION MAX_EXECUTION_TIME=10000")
        # query="select * from mbdc_mart.website_data_%s order by avg_rise desc ,today_rise_percentage desc"%str(period)
        # cur.execute(query)
        # data_len = cur.fetchall()[0]

        query="select * from mbdc_mart.website_data_%s order by avg_rise desc ,today_rise_percentage desc"%str(period)
        print("query",query)
        cur.execute(query)
        data = cur.fetchall()
        print(json.dumps(data))
        
        query = "select * from trading.all_trade_consolidated where trade_date >= CURDATE() - INTERVAL %s day"%str(period)
        print("query", query)
        cur.execute(query)
        all_data = cur.fetchall()
        all_data = json.dumps(all_data,default=myconverter)
        print (all_data)
        return render_template('dashboard.html',data=json.dumps(data),all_data=all_data, current_page_no=1,max_lenght=1000,period=period)


@app.route('/market', methods=['GET', 'POST'])
@login_required
def market_page():
    purchase_form = PurchaseItemForm()
    if request.method == "POST":
        purchased_item = request.form.get('purchased_item')
        p_item_object = Item.query.filter_by(name=purchased_item).first()
        if p_item_object:
            if current_user.can_purchase(p_item_object):
                p_item_object.buy(current_user)
                flash(f"Congratulations! You purchased {p_item_object.name} for {p_item_object.price}$", category='success')
            else:
                flash(f"Unfortunately, you don't have enough money to purchase {p_item_object.name}!", category='danger')

        return redirect(url_for('market_page'))

    if request.method == "GET":
        items = Item.query.filter_by(owner=None)
        return render_template('market.html', items=items, purchase_form=purchase_form)

@app.route('/register', methods=['GET', 'POST'])
def register_page():
    form = RegisterForm()
    if form.validate_on_submit():
        user_to_create = User(username=form.username.data,
                              email_address=form.email_address.data,
                              password=form.password1.data)
        db.session.add(user_to_create)
        db.session.commit()
        login_user(user_to_create)
        flash(f"Account created successfully! You are now logged in as {user_to_create.username}", category='success')
        return redirect(url_for('market_page'))
    if form.errors != {}: #If there are not errors from the validations
        for err_msg in form.errors.values():
            flash(f'There was an error with creating a user: {err_msg}', category='danger')

    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login_page():
    form = LoginForm()
    if form.validate_on_submit():
        attempted_user = User.query.filter_by(username=form.username.data).first()
        if attempted_user and attempted_user.check_password_correction(
                attempted_password=form.password.data
        ):
            login_user(attempted_user)
            flash(f'Success! You are logged in as: {attempted_user.username}', category='success')
            return redirect(url_for('market_page'))
        else:
            flash('Username and password are not match! Please try again', category='danger')

    return render_template('login.html', form=form)

@app.route('/logout')
def logout_page():
    logout_user()
    flash("You have been logged out!", category='info')
    return redirect(url_for("home_page"))

@app.route('/favicon.ico')
def hello():
    return redirect(url_for('static', filename='favicon.ico'), code=302)











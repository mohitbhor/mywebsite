from market import app
from flask import render_template, redirect, url_for, flash, request
from market.models import Item, User
from market.forms import RegisterForm, LoginForm, PurchaseItemForm
from market import db
from flask_login import login_user, logout_user, login_required, current_user
import time
import json

import mysql.connector


def get_mysql_connection():
    conn = mysql.connector.connect(
      host="localhost",
      db='trading',
      user="root",
      password="admin",
      raise_on_warnings=True
    )
    return conn

try:
    conn = get_mysql_connection()
except:
    time.sleep(5)
    conn = get_mysql_connection()
    pass


@app.route('/')
@app.route('/home')
def home_page():
    return render_template('home.html')

@app.route('/dashboard/<string:page_no>')
@app.route('/dashboard',methods=['GET','POST'])
def dashboard_page(page_no=1):
    if request.method == "GET":
        cur = conn.cursor(dictionary=True)
        query = """with last_record as (
                            select *,row_number() OVER (PARTITION BY symbol ORDER BY trade_date desc) as row_num from  trading.all_trade_consolidated atc 
                            where atc.mf_house is not null  -- atc.trade_date=(select max(t.trade_date) from trading.all_trade_consolidated t )
                            -- and atc.mf_house is not null 
                         ),
                         agg_records as (
                             select symbol,avg(today_rise_percentage) as avg_rise 
                             from trading.all_trade_consolidated atc2
                             where atc2.trade_date >= CURDATE() - INTERVAL 21 day
                             group by symbol
                             )
                        select count(*) from agg_records ag
                        left join last_record lr  on lr.symbol = ag.symbol
                        where lr.row_num = 1 """
        cur.execute(query)
        data_len = cur.fetchall()[0]

        offset = (int(page_no) - 1) * 10
        query="""with last_record as (
                    select *,row_number() OVER (PARTITION BY symbol ORDER BY trade_date desc) as row_num from  trading.all_trade_consolidated atc 
                    where atc.mf_house is not null  -- atc.trade_date=(select max(t.trade_date) from trading.all_trade_consolidated t )
                    -- and atc.mf_house is not null 
                 ),
                 agg_records as (
                     select symbol,avg(today_rise_percentage) as avg_rise 
                     from trading.all_trade_consolidated atc2
                     where atc2.trade_date >= CURDATE() - INTERVAL 21 day
                     group by symbol
                     )
                select ag.symbol,ag.avg_rise,lr.today_rise_percentage,lr.vol_rise_mv,lr.patterns from agg_records ag
                left join last_record lr  on lr.symbol = ag.symbol
                where lr.row_num = 1
                order by ag.avg_rise desc ,lr.today_rise_percentage desc limit 10 OFFSET %s """%(str(offset))


        cur.execute(query)
        data = cur.fetchall()
        print(json.dumps(data))
        print("page_no:",page_no)
        return render_template('dashboard.html',data=json.dumps(data),current_page_no=page_no,max_lenght=data_len)


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











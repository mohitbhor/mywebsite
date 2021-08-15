

function change_toggle_text_color(p_id){   //window.location.href = '/dashboard?period=30'
    var searchEles = document.getElementById("div_timeframe_filter").querySelectorAll("p");
    for(var i = 0; i < searchEles.length; i++) {
        if(searchEles[i].id == p_id) {
            searchEles[i].style = "color:green;";
            }
        else {
            searchEles[i].style = "color:blue;";
        }
    }
}
function getPatterJourney(data){
    //console.log("PATTERN JOURNEY")
    items = data.split('-->')
    ul = document.createElement('ul')
    ul.classList.add("list-group")
    for (each  in items){
        li = document.createElement('li')
        li.classList.add("list-group-item")
        a = document.createElement('a')
        date = items[each].split('=')[0]
        value = items[each].split('=')[1]
        bold = document.createElement('b')
        bold.appendChild(document.createTextNode(date+":"))
        a.appendChild(bold)
        //a.textContent = val
        a.appendChild(document.createTextNode( value))
        li.appendChild(a);
        ul.append(li)
        }
    //console.log(ul)
    return ul.outerHTML;
}
function createpageicon(curr_page=1,data,all_data,period=15,max_page=6){
    first_page = curr_page
    ul_element = document.getElementById("ul_pagination");
    var all_li = ul_element.querySelectorAll("li");
    for (j=1;j<all_li.length;j++){
    each_li = all_li[j];
    each_li.remove();
    }
    start = curr_page;
    end = curr_page+2;
    if (end < max_page){
        second_page = curr_page + 1
        third_page = curr_page + 2
        end = curr_page+2;
    }
    else{
        first_page = max_page - 2
        second_page = max_page - 1
        third_page = max_page
        end=max_page;
        }
    prev = start - 1
    next = end + 1
    li_element = document.createElement('li');
    if (start != 1){
        li_element.innerHTML = "<li><a class='page-link'><span aria-hidden='true'>&laquo;</span></a></li>";
        li_element.addEventListener("click",function(){createpageicon(prev,data,all_data,period)}, false);
        ul_element.append(li_element)
    }
    //for (i=start;i<=end;i++){
        li_element = document.createElement('li');
        li_element.innerHTML = "<li><a class='page-link' style='color:green;'><b>"+first_page+"</b></a></li>";
        li_element.addEventListener("click",function(){createpageicon(first_page,data,all_data,period)}, false);
        //li_element.style = "color:green;";
        ul_element.append(li_element)
         li_element = document.createElement('li');
        li_element.innerHTML = "<li><a class='page-link'>"+second_page+"</a></li>";
        li_element.addEventListener("click",function(){createpageicon(second_page,data,all_data,period)}, false);
        ul_element.append(li_element)
         li_element = document.createElement('li');
        li_element.innerHTML = "<li><a class='page-link'>"+third_page+"</a></li>";
        li_element.addEventListener("click",function(){createpageicon(third_page,data,all_data,period)}, false);
        ul_element.append(li_element)
    //}
    if (end != 6 && end < max_page ){
        li_element = document.createElement('li');
        li_element.innerHTML = "<li><a class='page-link'><span aria-hidden='true'>&raquo;</span></a></li>";
        li_element.addEventListener("click",function(){createpageicon(next,data,all_data,period)}, false);
        ul_element.append(li_element)
    }
    //console.log(data)  createpageicon(1,{{data|safe}})
    //console.log(typeof data)
    change_toggle_text_color("period_"+period)
    addTable(data,curr_page,all_data)
  }
function search(source=[],all_data,period=15) {
    //console.log("hi")
    var results;
    input = document.getElementById("myInput");
    query_symbol = input.value.toUpperCase();
    results = $.map(source, function(entry) {
        var match = entry.symbol.toUpperCase().indexOf(query_symbol) !== -1 || entry.patterns.toUpperCase().indexOf(query_symbol) !== -1;
        return match ? entry : null;
    });
    //console.log(results)
    createpageicon(curr_page=1,results,all_data,period,max_page=6)
    //return results;
}
function showHideGraph(tr_id,symbol,all_data){
        hidden_tr = document.getElementById(tr_id);

        div = document.getElementById("rowdiv_"+symbol);
        if (hidden_tr.style.display == 'none'){
                    hidden_tr.scrollIntoView(true)
                    hidden_td = document.getElementById(tr_id.replace('tr','td'));
                    filteredRecords = []
                    for (each in all_data){
                        if (all_data[each]['symbol'] == symbol ){
                             record = all_data[each]
                             console.log("showhidegraph")
                             console.log(record)
                             filteredRecords.push(record)
                             }
                    }

                    hidden_tr.style.display = ''
                    if (typeof(div) == 'undefined' || div == null){
                        console.log("****creating new div")
                        div = createDiv(symbol)
                        hidden_td.append(div)
                        console.log(hidden_tr)
                        priceChartId= "canvas1_"+symbol
                        createPriceChart(priceChartId,filteredRecords)
                        volChartId= "canvas2_"+symbol
                        createVolumeChart(volChartId,filteredRecords)
                        delChartId= "canvas3_"+symbol
                        createDeliveryChart(delChartId,filteredRecords)
                    }
                    else{
                        console.log("**** Div already exists *****")
                    }
        }
        else{
            hidden_tr.style.display = 'none'

        }
}
function createPriceChart(chartId,data){
    trade_date=[]
    ctx = chartId
    close_price=[]
    close_price_20_mv = []
    close_price_7_mv =[]
    rsi =[]
    patterns = []

    const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
    for (each in data){
        console.log("*****")
//        console.log(data[each])
        trade_date.push(data[each]['trade_date'])
        close_price.push(data[each]['close_price'])
        close_price_20_mv.push(data[each]['20_day_cp_mv_avg'])
        close_price_7_mv.push(data[each]['7_day_cp_mv_avg'])
        rsi.push(data[each]['rsi'])
        patterns.push(data[each]['patterns'])
    }
    var xValues = trade_date//[100,200,300,400,500,600,700,800,900,1000];
    //var delayBetweenPoints = 10000
    new Chart(chartId, {
      type: "line",
      data: {
        labels: xValues,
        datasets: [{
          label: 'Close Price',
          data: close_price,
          borderColor: "orange",
          fill: false
        },
        {
          label: '7 days Avg',
          data: close_price_7_mv,
          borderColor: "mediumaquamarine",
          fill: false
        },
        {
          label: '20 days Avg',
          data: close_price_20_mv,
          borderColor: "darkgrey",
          fill: false
        }]
      },
      options: {
            legend: {
                display: true,
                labels: {
                    boxWidth: 10,
                    boxHeight:10
                }
            },
             title: {
                display: true,
                text: 'Closing Price & Moving Averages'
              },
             tooltips: {
                 callbacks: {
                    label: function(tooltipItem, data) {
                            var i = tooltipItem.index;
                            console.log("****TOOLTIP-->"+i)
                            label = ["CP: "+close_price[i],"RSI: "+parseFloat(rsi[i]).toFixed(2),"PATTERN: "+patterns[i].trim()]
                            return label;
                 }
             }
            }
      }
    }
   )
}
function createVolumeChart(chartId,data){
    trade_date=[]
    daily_vol=[]
    daily_vol_20_mv = []
    daily_vol_7_mv = []
    for (each in data){
        trade_date.push(data[each]['trade_date'])
        daily_vol.push(data[each]['trade_quantity_thousand'])
        daily_vol_20_mv.push(data[each]['20_day_vol_mv_avg'])
        daily_vol_7_mv.push(data[each]['7_day_vol_mv_avg'])
    }
    var xValues = trade_date//[100,200,300,400,500,600,700,800,900,1000];
    new Chart(chartId, {
      type: "line",
      data: {
        labels: xValues,
        datasets: [{
          label: 'Daily Volume',
          data: daily_vol,
          borderColor: "orange",
          fill: false
        }, {
          label: '7 days Avg',
          data: daily_vol_7_mv,
          borderColor: "mediumaquamarine",
          fill: false
        },{
          label: '20 days Avg',
          data: daily_vol_20_mv,
          borderColor: "darkgrey",
          fill: false
        }]
      },
      options: {
            legend: {
                display: true,
                labels: {
                    boxWidth: 10,
                    boxHeight:10
                }
            },
             title: {
                display: true,
                text: 'Last Volume & Moving Averages'
              }

      }
    });
}
function createDeliveryChart(chartId,data){
    trade_date=[]
    daily_del=[]
    daily_del_20_mv = []
    daily_del_7_mv = []
    for (each in data){
        trade_date.push(data[each]['trade_date'])
        daily_del.push(data[each]['delivery_percentage'])
        daily_del_20_mv.push(data[each]['20_day_del_mv_avg'])
        daily_del_7_mv.push(data[each]['7_day_del_mv_avg'])
    }
    var xValues = trade_date//[100,200,300,400,500,600,700,800,900,1000];
    new Chart(chartId, {
      type: "line",
      data: {
        labels: xValues,
        datasets: [{
         label: 'Daily Delivery %',
          data: daily_del,
          borderColor: "orange",
          fill: false
        }, {
          label: '7 days Avg',
          data: daily_del_7_mv,
          borderColor: "mediumaquamarine",
          fill: false
        },{
          label: '20 days Avg',
          data: daily_del_20_mv,
          borderColor: "darkgrey",
          fill: false
        }]
      },
      options: {
            legend: {
                display: true,
                labels: {
                    boxWidth: 10,
                    boxHeight:10
                }
            },
             title: {
                display: true,
                text: 'Delivery % & Moving Averages'
              }

      }
    });
}
function createDiv(symbol){
    rowDiv = document.createElement('div')
    rowDiv.classList.add('row')
    rowDiv.setAttribute('id', 'rowdiv_'+symbol);
    rowDiv.style.display = ""


    colDiv1 = document.createElement('div')
    colDiv1.classList.add('col')
    canvas1 = document.createElement('canvas')
    canvas1.setAttribute('id', 'canvas1_'+symbol);
    canvas1.style = "width:100%;max-width:450px"
    colDiv1.appendChild(canvas1)

    colDiv2 = document.createElement('div')
    colDiv2.classList.add('col')
    canvas2 = document.createElement('canvas')
    canvas2.setAttribute('id', 'canvas2_'+symbol);
    canvas2.style = "width:100%;max-width:450px;margin-left:5px"
    colDiv2.appendChild(canvas2)

    colDiv3 = document.createElement('div')
    colDiv3.classList.add('col')
    canvas3 = document.createElement('canvas')
    canvas3.setAttribute('id', 'canvas3_'+symbol);
    canvas3.style = "width:100%;max-width:450px;margin-left:5px"
    colDiv3.appendChild(canvas3)

    rowDiv.appendChild(colDiv1)
    rowDiv.appendChild(colDiv2)
    rowDiv.appendChild(colDiv3)

    return rowDiv
}
function searchSymboltable(data) {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("tab_performance");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    symbol_td = tr[i].getElementsByTagName("td")[0];
    pattern_td = tr[i].getElementsByTagName("td")[4];
    if (symbol_td || pattern_td) {
      symbolValue = symbol_td.textContent || symbol_td.innerText;
      patternValue = pattern_td.textContent || pattern_td.innerText;
      if ((symbolValue.toUpperCase().indexOf(filter) > -1) || (patternValue.toUpperCase().indexOf(filter) > -1))
      {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
function addTable(data,current_page,all_data) {

    $(document).ready(function(){
    $('[data-toggle="popover"]').popover();})


    var tableBody = document.getElementById("tab_performance_body");
    // remove older TR first
    var all_tr = tableBody.querySelectorAll("TR");
    for (j=0;j<all_tr.length;j++){
        each_tr = all_tr[j];
        each_tr.remove();
    }
    start = (current_page - 1)*10
    end =  start + 10
    data_arr = []
    for (var each_key in data){
        each_element = data[each_key]
        data_arr.push(each_element)
    }
    page_data = data_arr.slice(start, end);
    for (var i = 0; i < page_data.length; i++) {
        var obj = page_data[i]
        var tr = document.createElement('TR');
        tr.setAttribute('id',i);
        tableBody.appendChild(tr);
        console.log(obj)
        for (var key in obj) {
              var td = document.createElement('TD');
              var value = obj[key];
              if (key == "companyname") {
                    //td.appendChild(document.createTextNode(value.trim()));
                    upperDiv = document.createElement('div')
                    upperDiv.textContent = value.trim()
                    lowerDiv = document.createElement('div')
                    var a = document.createElement('a')
                    a.classList.add("badge")
                    a.classList.add("badge-pill")
                    a.classList.add("badge-primary")
                    //var value = obj['industry']
                    a.style = "font-size:7px;text-align: center"//float:bottom; clear:left;"
                    a.textContent = obj['industry']
                    lowerDiv.append(a)
                    td.appendChild(upperDiv)
                    td.appendChild(lowerDiv)
                    tr.appendChild(td);
              }
              if (key == "symbol") {
                    td.appendChild(document.createTextNode(value));
//                    var p = document.createElement('p');
//                    p.classList.add("text-info")
//                    console.log("key['close_price']"+obj['obj'])
                    p = htmlToElement("<p class='text-info'><small><strong>CP: </strong>"+obj['close_price'] +"</small></p>")
                    td.appendChild(p)
                    tr.appendChild(td);
              }
              if(key == "avg_rise"){
                    value = parseFloat(value).toFixed(3)
                    td.appendChild(document.createTextNode(value));
                    play = document.createElement('span')
                    trId = "showhidetr"+i.toString()
                    console.log('the tr before calling on click is ->'+trId)
                    console.log(typeof allDataString)
                    var play = htmlToElement('<a href="#'+i.toString()+'" tittle="click here for detail"><i class="fa fa-line-chart secondary"  style="margin-left:4px;" tittle="click here for detail"></i></a>')

                    play.addEventListener("click", makeItHappenDelegate(trId,obj['symbol'],all_data))
                    td.appendChild(play);
                    tr.appendChild(td);
              }
              if (key == "today_rise_percentage" || key == "vol_rise_mv" || key == "del_rise_mv"){
                  var span = document.createElement('span');
                  value = parseFloat(value).toFixed(3)
                  span.classList.add("fas");
                  span.style = "align: center;"
                  if (value < 0){
                      span.classList.add("fa-arrow-down")
                      span.classList.add("text-danger")
                      }
                  else if(value > 0){
                      span.classList.add("fa-arrow-up")
                      span.classList.add("text-success")
                      }
                  else {
                      span.classList.add("fa-arrows-alt-h")
                      span.classList.add("text-success")
                  }
                  span.appendChild(document.createTextNode(" "+value));
                  //td.appendChild(document.createTextNode(value));
                  td.appendChild(span)
                  tr.appendChild(td);
              }
              if(key == "patterns"){
                   values = value.replace(/\s/g, '').split(",")
                   for (each in values){
                        if(values[each] != "" && !values[each].startsWith("twenty") && !values[each].startsWith("seven")){
                            var a = document.createElement('button')
                            a.type = 'button'
                            a.classList.add("btn")
                            a.classList.add("btn-sm")
                            a.classList.add("btn-info")
                            a.style = "font-size:9px;margin-right:4px;margin-bottom: 4px;"
                            a.textContent = values[each]
                            td.appendChild(a)
                        }

                   }
//                   var more = document.createElement('a')
//                    more.classList.add("badge")
//                    more.classList.add("badge-pill")
//                    more.classList.add("badge-primary")
//                    more.style = "font-size:12px;margin-right:4px;margin-bottom: 4px;"
//                    more.setAttribute('data-container', 'body');
//                    more.setAttribute('data-toggle', 'popover');
//                    more.setAttribute('data-placement', 'bottom');
//                    more.setAttribute('data-html', 'true');
//                    more.setAttribute('data-content',getPatterJourney(obj['pattern_journey']));
//                    more.setAttribute('rel', 'popover');
//                    more.textContent = "+"
//                    td.appendChild(more)
                   tr.appendChild(td);
              }
              if(key=="mf_house"){
                       if (value){
                           values = value.replace(/,/g, '').slice(0, -1).split("|")
                           actual_len = values.length
                           remaining_length = actual_len - 2
                           if (actual_len <= 2){
                                for(each in values){
                                      if (value[each] != ""){
                                        var a = document.createElement('a')
                                        a.classList.add("badge")
                                        a.classList.add("badge-pill")
                                        a.classList.add("badge-secondary")
                                        a.style = "font-size:9px;margin-right:4px;margin-bottom: 4px;"
                                        a.textContent = values[each]
                                        td.appendChild(a)
                                      }
                                }
                           }
                           else{k=0
                                for(each in values){
                                    if (k < 2){
                                          if (values[each] != ""){
                                            var a = document.createElement('a')
                                            a.classList.add("badge")
                                            a.classList.add("badge-pill")
                                            a.classList.add("badge-secondary")
                                            a.style = "font-size:9px;margin-right:4px;margin-bottom: 4px;"
                                            a.textContent = values[each]
                                            td.appendChild(a)
                                            k = k + 1
                                          }
                                    }
                                }
                                var a = document.createElement('a')
                                a.classList.add("badge")
                                a.classList.add("badge-pill")
                                a.classList.add("badge-primary")
                                a.style = "font-size:9px;margin-right:4px;margin-bottom: 4px;"
                                a.setAttribute('data-container', 'body');
                                a.setAttribute('data-toggle', 'tooltip');
                                a.setAttribute('data-placement', 'bottom');
                                a.setAttribute('data-html', 'true');
                                a.setAttribute('data-content',values.slice(2).join('; ') );
                                a.setAttribute('title',values.slice(2).join('; ') );
                                a.setAttribute('rel', 'popover');
                                a.textContent = "+"+remaining_length
                                td.appendChild(a)

                           }
                       }
                       tr.appendChild(td);
                   }
        }
        var hidden_tr = document.createElement('TR');
        var hidden_td = document.createElement('TD');
        hidden_td.setAttribute('colspan',8);
        //hidden_td.textContent = "show_hide_td_"+i
        hidden_td.setAttribute('id',"showhidetd"+i);
        hidden_tr.setAttribute('id',"showhidetr"+i);
        hidden_tr.style.display = "none"
        hidden_tr.appendChild(hidden_td);
        tableBody.appendChild(hidden_tr);
      }
}
function makeItHappenDelegate(a, b,c) {
  return function(){
      showHideGraph(a, b, c)
  }
}
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function getPatterJourney(data){
    //console.log("PATTERN JOURNEY")
    items = data.split('-->')
    ul = document.createElement('ul')
    ul.classList.add("list-group")
    for (each  in items){
        li = document.createElement('li')
        li.classList.add("list-group-item")
        a = document.createElement('a')
        date = items[each].split('=')[0]
        value = items[each].split('=')[1]
        bold = document.createElement('b')
        bold.appendChild(document.createTextNode(date+":"))
        a.appendChild(bold)
        //a.textContent = val
        a.appendChild(document.createTextNode( value))
        li.appendChild(a);
        ul.append(li)
        }
    //console.log(ul)
    return ul.outerHTML;
}

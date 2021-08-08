function change_toggle_text_color(p_id)
{   //window.location.href = '/dashboard?period=30'
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


function addTable(data,current_page) {
  var tableBody = document.getElementById("tab_performance_body");
  // remove older TR first
  var all_tr = tableBody.querySelectorAll("TR");
  for (j=0;j<all_tr.length;j++){
    each_tr = all_tr[j];
    each_tr.remove();
    }

  start = (current_page - 1)*10
  end =  start + 10
  console.log("start-",start)
  console.log("end-",end)
  data_arr = []

  for (var each_key in data){
    each_element = data[each_key]
    data_arr.push(each_element)
  }
  page_data = data_arr.slice(start, end);

  for (var i = 0; i < page_data.length; i++) {
    var obj = page_data[i]
    var tr = document.createElement('TR');
    tableBody.appendChild(tr);
    for (var key in obj) {
      var td = document.createElement('TD');
      var value = obj[key];
      console.log("keys---")
      console.log(key)
      if (key!="patterns"){
          td.appendChild(document.createTextNode(value));
          tr.appendChild(td);
      }
      else{
           td.appendChild(document.createTextNode("1111    1111"));
           tr.appendChild(td);
      }
    }
  }
}

function createpageicon(curr_page=1,data,period=15,max_page=10){
    //alert(typeof data)
    //alert(curr_page)
    console.log("data type below")
    console.log(typeof data)
    console.log("curr_page - "+curr_page)
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
        li_element.addEventListener("click",function(){createpageicon(prev,data,period)}, false);
        ul_element.append(li_element)
    }
    //for (i=start;i<=end;i++){
        li_element = document.createElement('li');
        li_element.innerHTML = "<li><a class='page-link' style='color:green;'><b>"+first_page+"</b></a></li>";
        li_element.addEventListener("click",function(){createpageicon(first_page,data,period)}, false);
        //li_element.style = "color:green;";
        ul_element.append(li_element)
         li_element = document.createElement('li');
        li_element.innerHTML = "<li><a class='page-link'>"+second_page+"</a></li>";
        li_element.addEventListener("click",function(){createpageicon(second_page,data,period)}, false);
        ul_element.append(li_element)
         li_element = document.createElement('li');
        li_element.innerHTML = "<li><a class='page-link'>"+third_page+"</a></li>";
        li_element.addEventListener("click",function(){createpageicon(third_page,data,period)}, false);
        ul_element.append(li_element)
    //}
    if (end != 6 && end < max_page ){
        li_element = document.createElement('li');
        li_element.innerHTML = "<li><a class='page-link'><span aria-hidden='true'>&raquo;</span></a></li>";
        li_element.addEventListener("click",function(){createpageicon(next,data,period)}, false);
        ul_element.append(li_element)
    }
    //console.log(data)  createpageicon(1,{{data|safe}})
    //console.log(typeof data)
    change_toggle_text_color("period_"+period)
    addTable(data,curr_page)
  }

function search(source=[]) {
    console.log("hi")
    var results;
    input = document.getElementById("myInput");
    query_symbol = input.value.toUpperCase();
    results = $.map(source, function(entry) {
        var match = entry.symbol.toUpperCase().indexOf(query_symbol) !== -1 || entry.patterns.toUpperCase().indexOf(query_symbol) !== -1;
        return match ? entry : null;
    });
    console.log(results)
    createpageicon(curr_page=1,results,max_page=6)
    //return results;
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
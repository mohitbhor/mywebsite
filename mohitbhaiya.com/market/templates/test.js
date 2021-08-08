function addTable(data,current_page) {
    console.log("Table current_page - ",current_page)
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
    tableBody.appendChild(tr);
    for (var key in obj) {
      var td = document.createElement('TD');
      var value = obj[key];
      if (key == "today_rise_percentage" || key == "vol_rise_mv"){
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
      else if(key == "avg_rise"){
           value = parseFloat(value).toFixed(3)
           td.appendChild(document.createTextNode(value));
           tr.appendChild(td);
      }
      else if(key == "patterns"){
           values = value.replace(/\s/g, '').split(",")
           for (each in values){
                if(values[each] != "" && !values[each].startsWith("twenty") && !values[each].startsWith("seven")){
                    var a = document.createElement('button')
                    a.type = 'button'
                    a.classList.add("btn")
                    a.classList.add("btn-sm")
                    a.classList.add("btn-info")
                    a.setAttribute('data-container', 'body');
                    a.setAttribute('data-toggle', 'popover');
                    a.setAttribute('data-placement', 'left');
                    a.setAttribute('data-html', 'true');
                    a.setAttribute('data-content', timeline_html);
                    a.setAttribute('rel', 'popover');
                    a.style = "font-size:9px;margin-right:4px;margin-bottom: 4px;"
                    a.textContent = values[each]
                    td.appendChild(a)
                }

           }
           tr.appendChild(td);
      }
      else if (key == "companyname") {
            td.appendChild(document.createTextNode(value.trim()));
            var a = document.createElement('a')
            a.classList.add("badge")
            a.classList.add("badge-pill")
            a.classList.add("badge-primary")
            //var value = obj['industry']
            a.style = "font-size:7px;float:bottom; clear:left;"
            a.textContent = obj['industry']
            td.appendChild(a)
            tr.appendChild(td);
      }
      else if(key="mf_house"){
               td.appendChild(document.createTextNode(value.trim()));
               if (value){
                   values = value.replace(/,/g, '').replace(/ /g, '').split("|")
                   console.log("***mutual fund****")
                   console.log(values)
                   actual_len = value.length
                   remaining_length = actual_len - 2
                   if (actual_len <= 2){
                        for(each in values){
                              if (value[each] != ""){
                                var a = document.createElement('a')
                                a.classList.add("badge")
                                a.classList.add("badge-pill")
                                a.classList.add("badge-primary")
                                a.style = "font-size:9px;margin-right:4px;margin-bottom: 4px;"
                                a.textContent = value[each]
                                td.appendChild(a)
                              }
                        }
                   }
                   else{i=0
                        if (i <= 2){
                            for(each in values){
                                  if (value[each] != ""){
                                    var a = document.createElement('a')
                                    a.classList.add("badge")
                                    a.classList.add("badge-pill")
                                    a.classList.add("badge-primary")
                                    a.style = "font-size:9px;margin-right:4px;margin-bottom: 4px;"
                                    a.textContent = value[each]
                                    td.appendChild(a)
                                  }
                                 i++
                            }
                        }
                        else{
                            var a = document.createElement('a')
                            a.classList.add("badge")
                            a.classList.add("badge-pill")
                            a.classList.add("badge-primary")
                            a.style = "font-size:9px;margin-right:4px;margin-bottom: 4px;"
                            a.textContent = "+"+remaining_length
                            td.appendChild(a)
                        }

                   }
               }
               tr.appendChild(td);
           }
      else {
            td.appendChild(document.createTextNode(value));
            tr.appendChild(td);
      }
    }
  }
  }
  // myTableDiv.appendChild(table);

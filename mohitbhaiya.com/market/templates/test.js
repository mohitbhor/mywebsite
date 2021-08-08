function addpageicon(current_page_no = 1){
    console.log("current_page-"+current_page_no)
    ul_element = document.getElementById("ul_pagination");
    start = current_page_no
    console.log("start-"+start)
    end = current_page_no + 3
    console.log("end-"+end)
    for (i = start; i < end; i++) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.classList.add('page-link')
        a.addEventListener('click',function(){addpageicon(current_page_no+i);});
        if (i == current_page_no){
            a.style = "color:green;";
            a.appendChild(document.createTextNode(i));
        }
        else{
            a.appendChild(document.createTextNode(i));
            a.style = "color:red;";
        }
       // if (i == 1){
       //     prev_a = document.getElementById("prev_page");
       //     prev_a.style.display = "none";
       // }
        li.class = "page-item";
        li.appendChild(a);
        ul_element.appendChild(li);
        li.id=i
        //console.log(a)
        console.log("inside second")
    }
    var all_li = ul_element.querySelectorAll("li");
    console.log("inside second")
    console.log(all_li.lenght)
    console.log(all_li)
    for (i=1;i < all_li.lenght;i++){
        each_li = all_li[i]
        console("this one to be removed--"+each_li)
        console.log(each_a)
        if (each_li.id < current_page_no){
         each_a.style.display = "none";
        }
    }
}
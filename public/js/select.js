let select_x, select_i, select_j, selElmnt, select_a, select_b, select_c;
/*look for any elements with the class "custom-select":*/
select_x = document.getElementsByClassName("custom-select");
for (select_i = 0; select_i < select_x.length; select_i++) {
  selElmnt = select_x[select_i].getElementsByTagName("select")[0];
  /*for each element, create a new DIV that will act as the selected item:*/
  select_a = document.createElement("DIV");
  select_a.setAttribute("class", "select-selected");
  select_a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  select_x[select_i].appendChild(select_a);
  /*for each element, create a new DIV that will contain the option list:*/
  select_b = document.createElement("DIV");
  select_b.setAttribute("class", "select-items select-hide");
  for (select_j = 1; select_j < selElmnt.length; select_j++) {
    /*for each option in the original select element,
    create a new DIV that will act as an option item:*/
    select_c = document.createElement("DIV");
    select_c.innerHTML = selElmnt.options[select_j].innerHTML;
    select_c.addEventListener("click", function(e) {
        /*when an item is clicked, update the original select box,
        and the selected item:*/
        var y, select_i, k, s, h;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        h = this.parentNode.previousSibling;
        for (select_i = 0; select_i < s.length; select_i++) {
          if (s.options[select_i].innerHTML == this.innerHTML) {
            s.selectedIndex = select_i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            for (k = 0; k < y.length; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    select_b.appendChild(select_c);
  }
  select_x[select_i].appendChild(select_b);
  select_a.addEventListener("click", function(e) {
      /*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });
}
function closeAllSelect(elmnt) {
  /*a function that will close all select boxes in the document,
  except the current select box:*/
  var select_x, y, select_i, arrNo = [];
  select_x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  for (select_i = 0; select_i < y.length; select_i++) {
    if (elmnt == y[select_i]) {
      arrNo.push(select_i)
    } else {
      y[select_i].classList.remove("select-arrow-active");
    }
  }
  for (select_i = 0; select_i < select_x.length; select_i++) {
    if (arrNo.indexOf(select_i)) {
      select_x[select_i].classList.add("select-hide");
    }
  }
}
/*if the user clicks anywhere outside the select box,
then close all select boxes:*/
document.addEventListener("click", closeAllSelect);
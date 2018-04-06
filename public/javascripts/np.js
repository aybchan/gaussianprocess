// why doesn't javascript have numpy array operations :/

var NP = function () {

  function linspace(startValue, stopValue, cardinality) {
    var arr = [];
    var currValue = startValue;
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(currValue + (step * i));
    }
    return math.matrix(arr);
  }

  function random_int(from,to,len) {
    var rand = [];
    for ( var i = 0; i < len; i++ ) {
      rand.push(math.floor(math.random() * (to - from)) + from);
    }
    return math.matrix(rand);
  };

  function random_float(from,to,len) {
    var rand = [];
    for ( var i = 0; i < len; i++ ) {
      rand.push((math.random() * (to - from)) + from);
    }
    return math.matrix(rand);
  };

  function ones(size,p) {
    var ones = [];
    for (var i_ones = 0; i_ones < size; i_ones++) {
      ones.push(1);
    }
    return math.multiply(math.matrix(ones),p);
  }

  function subtract(a,b) {

    var a_len = a._data.length;
    var b_len = b._data.length;
    var rows = new Array(a_len);

    for (var i = 0; i < a_len; i++) {
      rows[i] = new Array(b_len);
      for (var j = 0; j < b_len; j++) {
        rows[i][j] = a._data[i] - b._data[j];
      };
    };

    return rows;
  };

  function random_normal(size) {
    var a = [];

    for ( var i = 0; i < size; i++){
        a.push(d3.randomNormal(0,1)());
    }
    return math.matrix(a);
  }

  function element_op(mat,op) {
    var new_mat = [];
    mat.forEach(function (row, index, mat) {
      var new_row = [];
      row.forEach(function (elem, id, mat) {
        new_row.push(elem**2);
      });
      new_mat.push(new_row);
    });
    return math.matrix(new_mat);
  };

  return {
    linspace: linspace,
    ones: ones,
    subtract: subtract,
    random_normal: random_normal,
    random_int: random_int,
    random_float: random_float,
    element_op: element_op
  };
};

var Kernel = function () {

  function squared_exponential (x_i,x_j) {
    var sigma = 1;
    var p = 1;
    var ell = 1;

    var k = math.abs(np_subtract_vec(x_i,x_j));
    k = math.multiply(math.pi,k);
    k = math.multiply(k,1/p);
    k = math.abs(k);
    k = np_element_op(k,function(d) { return math.sin(d)**2; });
    k = math.multiply(-2/ell**2, k)

    // return here for periodic kernel
//    return k

    var l = np_subtract_vec(x_i,x_j);
    l = np_element_op(l,function (d) { return math.pow(d,2); });
    k = math.exp(math.subtract(k,l));
     return k;

    var c = 1
    var sig_i = 1
    var sig_j = 1

    //var A = math.multiply(math.subtract(math.reshape(x_i,[x_i._data.length,1]),c),math.reshape(math.subtract(math.matrix(x_j),c),[1,x_j._data.length]));
    //var A = math.subtract(math.reshape(x_i,[x_i._data.length,1]),c)
    //var B = math.reshape(math.subtract(x_j,c),[1,x_j._data.length])
    //var m = math.multiply(A,B)
    //m = math.add(sig_j,math.multiply(sig_i,m))

    //return k
  };


  return {
    squared_exponential: squared_exponential
  };
};

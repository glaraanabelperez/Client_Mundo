<?php
    header('Access-Control-Allow-Origin: *');
    header("Access-Control_Allow-Headers: origin, X-Requested-With,Content-Type, Accept");//le pide acceso al header
    header('Access-Control-Allow-Methods: GET, POST');

    $json=file_get_contents('php://input');
    $params=json_decode($json);
    
    require 'Db.class.php';
    /*Instancia del objeto, conexion*/
    $bd=Db::getInstance();

    $id=$params->codigo_user;
    $percent=$params->pricePercent;

    $sql= "UPDATE `productos` SET `precio` = ROUND( `precio` * 1.20, 2 )  
    WHERE `id_usuario`='$id'";
    
    $respuesta=$bd->ejecutar($sql);

    class Result{}
    $response=new Result();
     if($respuesta==true){
        $response->resultado='OK';
        $response->mensaje='SE AGRAGO EXITOSAMENTE LA PROPIEDAD';
     }else{
      echo mysqli_error($bd);
     // $response->resultado='Error';
    }
    //genera los datos de respuesta
    header('Content-Type: application/json');
    echo json_encode($response);//muestra el json , el mensaje
?>
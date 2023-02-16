import { Component, OnInit , Output, EventEmitter, ViewChild, ElementRef, Inject, Input, Query} from '@angular/core';
import { Filter } from 'src/app/core/products/listProducts/models/Filter';
import { OrderField } from 'src/app/core/products/listProducts/models/OrderField';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from 'src/app/auth-services/auth.service';
import { CategoryModel } from '../categories/models/categoryModel';
import { LoadingService } from 'src/app/services/loading.service';
import { CatgeorieService } from '../categories/service/categorie.service';
import { ProductService } from './service/product.service';
import { ProductModelResponse } from './models/productModelResponse';
import { MarcaModel } from '../marcas/models/marcaModel';
import { MarcaService } from '../marcas/service/marca.service';
import { OrderService } from 'src/app/orders/service/order.service';
import { Order } from 'src/app/orders/models/Order';



@Component({
    selector: 'app-list-products',
    templateUrl: './listProducts.component.html',
    styleUrls: ['./listProducts.component.scss']
  })

  export class ListProductsComponent implements OnInit {

    public products:ProductModelResponse[]=[];
    public recordCount: any=0;
    public categories:CategoryModel[];
    public marcas:MarcaModel []=[];

    //Filtros
    @ViewChild(NgForm) myForm: NgForm;  

    public filter:Filter;
    public order:OrderField;
    public orderAsc:boolean; 
    public orderSelect;
    public from:number;
    public show: any =true;
    
    //Modales
    public data = [];
    public selectedItem: any;


    //Modal Images
    public hiddeModal: boolean;
    public productIdToModel: number;
    public cabecera: string;
    

    constructor( 
      private productService:ProductService, 
      private categorieService:CatgeorieService, 
      private marcasService:MarcaService,
      private _serviceOrder:OrderService,
      public loadingService:LoadingService, 
      private router: Router, private auth:AuthService,
      private rutaActiva: ActivatedRoute
    ) {
 
    }
     
    ngOnInit(): void {
      this.filter=new Filter();

      this.getCategoryByMarca();  
      this.getMarkByCategory();
      window.scroll(0,0)
      this.getParams();

    }

    ngAfterViewInit() { 
      //this.listAllProducts(this.filter);
      this.onChangesFilters();
    }
    
    public addToCar(p:ProductModelResponse){
      let pedido:Order={
        nameImage: p.ImageName,
        categoryName: p.CategoryName,
        marcaName: p.MarcaName,
        productId: p.ProductId,
        count: 1,
        name: p.Name,
        price: p.Price,
        priceWithDiscount: p.PriceWithDiscount,
        priceTotal: p.PriceWithDiscount,
        discount: p.DiscountAmount      
      }
      this._serviceOrder.agregarPedido(pedido);
    }

    public getParams(){
      if(this.rutaActiva.snapshot.params.filter == 'categoria'){
        this.filter.CategoryId=this.rutaActiva.snapshot.params.value;
        this.setHeaderCategory();
      }
      if(this.rutaActiva.snapshot.params.filter == 'descuento'){
        this.filter.Discount=this.rutaActiva.snapshot.params.filter == 'descuento'? true : null;
      }
      this.rutaActiva.params.subscribe(params => {
        // this.param = params['yourParam'];
        if(this.rutaActiva.snapshot.params.filter == 'marca'){
          this.filter.MarcaId=this.rutaActiva.snapshot.params.value;
          this.filter.MarcaId = this.filter.MarcaId ==-1 ? null : this.filter.MarcaId;
          this.setHeaderMark();
        }
      }); 
    }

    public onChangesFilters(): void {
      this.myForm.valueChanges.subscribe((x:Filter) => {  
        this.listAllProducts(x);
      });
    }
 
    public listAllProducts(x:Filter){     
      this.loadingService.setLoading(true);
      var itemsPerPage=null;
        this.productService.listAllProducts(x, this.order, this.from, itemsPerPage, this.orderAsc).subscribe(
          res=>{
            if(res['RecordsCount']!=0){
              this.products=[];
              this.products=res['Data'] as ProductModelResponse [];
              this.recordCount=res['RecordsCount'];
            }else{
              alert("PRODUCTO NO DISPONIBLE, INTENTE CAMBIANDO LOS FILTROS")
              //Case when list product is null then empty secondary filters.
              if(this.cabecera=="marca"){
                this.filter.CategoryId=null;
              }else{
                this.filter.MarcaId=null;
              }
            }          
            this.loadingService.setLoading(false);
          },
          error=>{
            alert('ERROR DE SERVIDOR');
            this.loadingService.setLoading(false);
          }
        );
        
    }
  
    public edit(productId:number){   
      this.productService.productId=productId;
    }

    public eliminar(p){
      this.loadingService.setLoading(true);
      this.productService.delete(p).subscribe(
        datos=>{
            alert("SE ELIMINO EXITOSAMENTE")
            this.loadingService.setLoading(false);
            this.onChangesFilters();
        },
        error =>{
          alert('ERROR DE SERVIDOR');
          this.loadingService.setLoading(false);
        }
      );   
    }

    public procesImages(productId:number):void{
      this.productIdToModel=productId
      this.hiddeModal=  this.hiddeModal ? false : true;
      window.scroll(0,0)
    } 

    public  isLogin():boolean{
      return this.auth.isLoggedIn()
    }

    public showFilters(){
      this.show=!this.show ? true : false;
    }

    //The options values for e are in the html.
    public setOrder(e){
      if(e==1 || e==3){
        //Case 1 and 3 ever the order is asc, But this order can be by price or title then:
        //Case when e = 1 (Order by price )  OrderField.Pprice else  OrderField.title
        this.orderAsc=true
        this.order = e == 1 ? OrderField.price : OrderField.title       
      }
      if(e == 2 || e == 4){
         //Case 2 and 4 ever the order is desc, But this order can be by price or title then:
        //Case when e = 1 (Order by price )  OrderField.Pprice else  OrderField.title
        this.orderAsc= false
        this.order= e == 2 ? OrderField.price : OrderField.title  
      }
      this.onChangesFilters();
    }
    // Is Active when change Mark!
    public setHeaderMark(){
      var x:number=this.filter.CategoryId
      //Set Header Filter with Mark, only if Catgeory is null
      if( this.filter.MarcaId!=null && x==null){
        this.cabecera="marca";
      }
      
      // If change the headerMark change categories.
      if(this.cabecera=="marca" ||  this.filter.MarcaId==null){
        if( this.filter.MarcaId==null){ //Put Off HeadreFilters
          this.cabecera="";
        }
        this.filter.CategoryId=null;
        this.getCategoryByMarca();
      }
      this.listAllProducts(this.filter);

    }

    //Is Active when chenge Category!
    public setHeaderCategory(){
      //Set headerFilters with Category only if Mark is null
      if(this.filter.CategoryId!=null && this.filter.MarcaId==null){
        this.cabecera="category";
      }
      
      // If change the headerCategory change marks.
      if(this.cabecera =="category" || this.filter.CategoryId==null){
        if(this.filter.CategoryId==null){ //Put off headerFilters
          this.cabecera="";
        }
        this.filter.MarcaId=null;
        this.getMarkByCategory();
      }
      this.listAllProducts(this.filter);

    }

    public getCategoryByMarca(){
      this.loadingService.setLoading(true);
      this.categorieService.getCategoryByMarca(this.filter.MarcaId).subscribe(
        res=>{
          this.categories=[];
          this.categories=res as CategoryModel[];        
          this.loadingService.setLoading(false);
        },
        error=>{
          alert('ERROR DE SERVIDOR');
          this.loadingService.setLoading(false);
        }
      );
    }

    public getMarkByCategory(){
      this.marcasService.getMarcaByCategory(this.filter.CategoryId).subscribe(
        res=>{
          this.marcas=[];
          this.marcas=res as MarcaModel[];        
          this.loadingService.setLoading(false);
        },
        error=>{
          alert('ERROR DE SERVIDOR');
          this.loadingService.setLoading(false);
        }
      );
    }

    // ngOnDestroy(): void {
    //   // this.subsChangeFilters.unsubscribe();
    // }

}
  
  
import { Component, OnInit , Output, EventEmitter, ViewChild, ElementRef, Inject, Input, Query} from '@angular/core';
import { Filter } from 'src/app/core/products/listProducts/models/Filter';
import { OrderField } from 'src/app/core/products/listProducts/models/OrderField';
import { Subscription } from 'rxjs';
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
import { ProductModel } from './models/productModel';


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
    public filterSelection:string="Nigun filtro seleccionado";
    public from:number;
    public show: any =true;
    
    //Modales
    public data = [];
    public selectedItem: any;


    //Images
    public hiddeModal: boolean;
    public productIdToModel: number;

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
      this.traerCategorias();  
      this.getMarcas();
      this.getParams();
      this.listAllProducts();
      window.scroll(0,0)
    }

    ngAfterViewInit() { 
      // this.onChangesFilters();
      //this.subs = this.myForm.valueChanges.pipe(
    //             switchMap(() => {
    //               // this.isLoadingResults = true;
    //               return this.productService.listAllProducts(
    //                 this.filter, this.order, this.from, null, this.orderAsc
    //               );
    //             }),
    //             map(res => {
    //               this.recordCount=res['RecordsCount'];
    //               this.loadingService.setLoading(false);
    //               return res['Data'] as ProductModelResponse [];
    //             }),
    //             catchError(() => {
    //               return observableOf([]);
    //             })
    //           ).subscribe(data => this.products = data as []);
    }
    
    public addToCar(p:ProductModelResponse){
      let priceWithDiscount=(p.Price-p.DiscountAmount)
      let pedido:Order={
        nameImage: p.ImageName,
        categoryName: p.CategoryName,
        marcaName: p.MarcaName,
        productId: p.ProductId,
        count: 1,
        name: p.Name,
        price: p.Price,
        priceWithDiscount: priceWithDiscount,
        priceTotal: priceWithDiscount,
        discount: p.DiscountAmount      
      }
      this._serviceOrder.agregarPedido(pedido);
  }

    public getParams(){
      this.rutaActiva.params.subscribe(
        (params: Params) => {
          this.filter.MarcaId=params.filterId;
          this.filter.CategoryId=params.categoryId;
          this.filter.Discount=params.discount;
        }
      );
      this.filter.CategoryId=this.rutaActiva.snapshot.params.filter == 'categoria'? this.rutaActiva.snapshot.params.value : null;
      this.filter.MarcaId=this.rutaActiva.snapshot.params.filter == 'marca'? this.rutaActiva.snapshot.params.value : null;
      this.filter.Discount=this.rutaActiva.snapshot.params.filter == 'descuento'? true : null;
    }
    // Filtros
    public onChangesFilters(): void {
      this.myForm.valueChanges.subscribe((x) => {   
        this.listAllProducts();
      });
    }
 
    public listAllProducts(){      
      this.loadingService.setLoading(true);
      var itemsPerPage=null;
        this.productService.listAllProducts(this.filter, this.order, this.from, itemsPerPage, this.orderAsc).subscribe(
          res=>{
            this.products=[];
            this.products=res['Data'] as ProductModelResponse [];
            this.recordCount=res['RecordsCount'];
            this.loadingService.setLoading(false);
          },
          error=>{
            alert('ERROR DE SERVIDOR');
            this.loadingService.setLoading(false);
          }
        );
        if(this.products.length=0){
          alert("No se encuentra productos disponibles con esas caratceristicas")
        }
    }
  
    public edit(productId:number){   
      this.productService.productId=productId;
      return false;
    }

    public eliminar(p){
      this.loadingService.setLoading(true);
      this.productService.delete(p).subscribe(
        datos=>{
            alert("SE ELIMINO EXITOSAMENTE")
            this.loadingService.setLoading(false);
            this.listAllProducts(); 
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

    //lista categorias
     public traerCategorias(){
        this.categorieService.list().subscribe(
          res=>{
            this.categories=res;
          },
          error=>{
            alert('EL USUARIO NO SE ENCUENTRA REGISTRADO');
          }
        );

    }

    public getMarcas(){
        this.marcasService.getMarcas().subscribe(
          res=>{
            this.marcas=res;      
          },
          error=>{
            alert('HUBO UN PROBLEMA CON EL SERVIDOR');
          }
        );

    }

    public  isLogin():boolean{
      return this.auth.isLoggedIn()
    }

    public showFilters(){
      this.show=!this.show ? true : false;
    }

    public setOrder(e){
      if(e==1 || e==3){
        this.orderAsc=true
        this.order = e == 1 ? OrderField.price : OrderField.title       
      }
      if(e == 2 || e == 4){
        this.orderAsc= false
        this.order= e == 2 ? OrderField.price : OrderField.title  
      }
      this.listAllProducts()
    }

    // public setCategory(c:number){
    //   this.filter.CategoryId=c;
    //   // this.listAllProducts()
    // }

    // public setMarca(c:number){
    //   this.filter.MarcaId=c;
    //   // this.listAllProducts()
    // }

    public limpiarSelection(){
      this.filterSelection=null;
    }

    // ngOnDestroy(): void {
    //   // this.subsChangeFilters.unsubscribe();
    // }

}
  
  
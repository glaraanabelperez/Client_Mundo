import { Component, OnInit , Output, EventEmitter, ViewChild, ElementRef, Inject, Input} from '@angular/core';
import { DOCUMENT } from '@angular/common';
// import { ServiceMetodos } from 'src/app/core/servicios-generales/service-general.metodos';
import { CategoryModel } from 'src/app/core/models/categoryModel';
import { ProtectedService } from '../../core/services/protected.service';
import { ServiceGeneral } from 'src/app/core/services/service-general.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductService } from 'src/app/core/services/product.service';
import { DiscountService } from 'src/app/core/services/discount.service';
import { ProductModel } from 'src/app/core/models/productModel';
import { ProductImageModel } from 'src/app/core/models/productImageModel';
import { ImageService } from 'src/app/core/services/imageService';
import { MarcaModel } from 'src/app/core/models/marcaModel';
import { DiscountModel } from 'src/app/core/models/discountModel';
import { CatgeorieService } from 'src/app/core/services/categorie.service';
import { MarcaService } from 'src/app/core/services/marca.service';


@Component({
    selector: 'add-prod',
    templateUrl: './add-prod.html',
    styleUrls: ['./add-prod.scss']
  })

  export class AddProduct implements OnInit {

  // @Input() editProduct :Productos;

  public state: any[]=[{ valor:false, name:'Suspendido'}, { valor:true, name:'Activo'}];
  public uploadForm: any;

  public product:ProductModel=null;
  public marcas:MarcaModel[];
  public categories: CategoryModel[];
  public discounts: DiscountModel[];
  public images: ProductImageModel []=[];
 
  private userId: string;
  private today: string;
  
  private accionBtnFormulario: string;

  public newImage: any;
  public showNewImage: string | ArrayBuffer;
  public message: string;
  public editImage: string;

  

    constructor( 
      private productService:ProductService, private imageService:ImageService,
      private categoireService:CatgeorieService,private marcaService:MarcaService,
      private discountService:DiscountService, private _servicioGeneral:ServiceGeneral, 
      private formBuilder:FormBuilder, @Inject(DOCUMENT) private document: Document
    ){
  
    }
     
  ngOnInit(): void {

    this.getCategories(); 

    this.uploadForm=this.formBuilder.group({
      productId:[null],
      categoryId:[null,[Validators.required]],
      marcaId:[null,[Validators.required]],
      discountId:[null],
      name:['',[Validators.required]],
      description:[''],
      nameImage: [null],
      state:['',[Validators.required]],
      price:[null],
      featured:[''],
    });

    if(this.productService.productId!=null){
      this.accionBtnFormulario="editar"
      this.getProduct();     
      this.getAllMarcas(); 
      this.getActiveDiscounts(); 
      this.getImages(this.productService.productId);
    }else{
      this.accionBtnFormulario="nuevo";
    }
    
    this.userId=localStorage.getItem('codigo_usar'); 
    this.getFecha();

    }

    get f(){ return this.uploadForm.controls;}

    //
    getCategories(){
      this.categoireService.listCategories().subscribe(
        res=>{
          this.categories=res as [];
        },
        error=>{
          alert('HUBO UN PROBLEMA CON EL SERVIDOR');
        }
      );
    
    }

    getAllMarcas(){
      this.marcaService.getAllMarcas().subscribe(
        res=>{
          this.marcas=res as [];
        },
        error=>{
          alert('HUBO UN PROBLEMA CON EL SERVIDOR');
        }
      );
    
    }

    getActiveDiscounts(){
      this.discountService.getActiveDiscounts().subscribe(
        res=>{
          this.discounts=res as [];
        },
        error=>{
          alert('HUBO UN PROBLEMA CON EL SERVIDOR');
        }
      );
    
    }

    getProduct(){
      this.productService.getProduct().subscribe(
        res=>{
          this.product=res; 
          this.editarPubliId(res);
        },
        error=>{
          alert('HUBO UN PROBLEMA CON EL SERVIDOR');
        }
      );
    
    }

    getImages(productId:number){
      this.imageService.getImages(productId).subscribe(
        res=>{
          this.images=res;
          console.log("img", this.images)
        },
        error=>{
          alert('HUBO UN PROBLEMA CON EL SERVIDOR');
        }
      );
    
    }

    getFecha(){
      var d = new Date();
      this.today = d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate();
    }

    public editImage_(image:ProductImageModel){
      console.log(image)
    }

    guardarImagenEnFormGroup(files){
      this.newImage=files;
      let imagen = files[0];
      this.uploadForm.controls['nombreImagen'].setValue(imagen ? imagen.name : ''); // <-- Set Value for Validation
    }
    
    respuesta;
    verificarImgServidor(files) {
      let fileImg=new FormData();
      fileImg.append('file', files[0], files[0].name); 
      this._servicioGeneral.existeImgServidor(fileImg) 
        .subscribe(
          response => {
            this.respuesta = response; 
            if(this.respuesta <= 1){
                alert("Error servidor")
                return;
            }else{
              if(this.respuesta.status == "success"){
                    this.guardarImagenEnFormGroup(files);
                    var reader = new FileReader();
                    reader.readAsDataURL(files[0]); 
                    reader.onload = (_event) => { this.showNewImage = reader.result;
                    }
              }else if(this.respuesta.status == "error"){
                alert("Ya existe la imagen")
                return;
              }
            }
          },
          error => {
            alert("Error sistema imagen")
            return;
          });
      return;
    }
  
    previsualizarImg(files){
      var img = files[0].type;
      if (files.length === 0){
        return;
      }else if (img.match(/image\/*/) == null) {
        this.message = "Only images are supported.";
        return; 
      }else{
        this.verificarImgServidor(files);
      }
    }

    submitted=false;
    onSubmit(){
      this.submitted=true;
      if(this.uploadForm.invalid){
        return;
      }else{
        if(this.accionBtnFormulario=="editar"){
          if(this.showNewImage!=null){
            // this._service_protected.procesar(this.img_editar,this.imagenNueva_guardar, this.uploadForm.value );
          }
          if(this.showNewImage==null){
            // this._service_protected.editarDatos(this.uploadForm.value);
            alert('Publicacion Editada');
          }  
        }
        if(this.accionBtnFormulario=="nuevo"){
          if(this.showNewImage!=null){
            // this._service_protected.guardarArchivoServidor(this.imagenNueva_guardar);
          }
          // this._service_protected.insertarDatos(this.uploadForm.value);
          alert('Publicacion Cargada');
        }
      }
      this.accionBtnFormulario="nuevo";
      this.limpiar();
    }
  
    limpiar(){
      this.document.location.reload(); 
      // this.router.navigate(['/protected']);
    }
  
    editarPubliId(e: ProductModel){
      this.uploadForm.controls.productId.setValue(e.ProductId );
      this.uploadForm.controls.categoryId.setValue(e.CategoryId );
      this.uploadForm.controls.marcaId.setValue(e.MarcaId );
      this.uploadForm.controls.discountId.setValue(e.DiscountId );
      this.uploadForm.controls.name.setValue(e.Name );
      this.uploadForm.controls.description.setValue(e.Description );
      // this.uploadForm.controls.nameImage.setValue(e.ImageName );
      this.uploadForm.controls.price.setValue(e.Price );
      this.uploadForm.controls.featured.setValue(e.Featured );
      this.uploadForm.controls.state.setValue(e.State );
      // this.uploadForm.controls.userId.setValue(e.UserId );
      // this.uploadForm.controls['productId'].setValue(e.ProductId ? e.ProductId: ''); // <-- Set Value for Validation

      window.scrollTo(0,0);
      // if(e.NameImage!=null){
      //   this.editImage=e['nombreImagen']
      // }
   }

    
}
  
  
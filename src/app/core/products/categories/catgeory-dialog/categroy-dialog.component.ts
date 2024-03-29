import { Component, OnInit , Output, EventEmitter, ViewChild, ElementRef, Inject, Input} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CategoryModel } from 'src/app/core/products/categories/models/categoryModel';
import { FormBuilder, Validators } from '@angular/forms';
import { CatgeorieService } from 'src/app/core/products/categories/service/categorie.service';
import { MarcaService } from 'src/app/core/products/marcas/service/marca.service';
import { LoadingService } from 'src/app/services/loading.service';


@Component({
    selector: 'app-category-dialog',
    templateUrl: './category-dialog.component.html',
    styleUrls: ['./category-dialog.component.scss']
  })

  export class CategoryDialogComponent
  {

  public uploadForm: any;
  private editing: boolean;

  @Input() data: CategoryModel;
  @Output() closeModal = new EventEmitter();
  

    constructor( 
      public loadingService:LoadingService, 
      private categoireService:CatgeorieService,
      private formBuilder:FormBuilder, @Inject(DOCUMENT) private document: Document
    ){}
     
  ngOnInit(): void {
    this.uploadForm=this.formBuilder.group({
        CategoryId:[null],
        Name:[null,[Validators.required]],    
    });
    this.editing=this.data!=null ? true: false
    this.editarPubliId(this.data)
  }

  get f(){ return this.uploadForm.controls;}

  onCloseModal(): void {
    this.closeModal.emit();
  }

  
  editarPubliId(e: CategoryModel){
      this.uploadForm.controls.CategoryId.setValue(e.CategoryId );
      this.uploadForm.controls.Name.setValue(e.Name );
      window.scrollTo(0,0);
  }

  submitted=false;
  onSubmit(){
    this.submitted=true;
    if(this.uploadForm.invalid){
      return;
    }else{
        this.postCategory();
    }
  }

  postCategory(){
    this.categoireService.postCategory(this.uploadForm.value).subscribe(
      res=>{
        this.loadingService.setLoading(false);
        alert('ACCION EXITOSA');
        this.onCloseModal();
      },
      error=>{
        this.loadingService.setLoading(false);
        alert('ERROR EN EL SERVIDOR');
        this.onCloseModal();
      }
    );
  }

    
}
  
  
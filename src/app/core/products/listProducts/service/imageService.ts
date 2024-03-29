import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ImageTranser } from '../models/imagesTransferModel';
import { ProductImageModel } from '../models/productImageModel';

@Injectable({
  providedIn: 'root'
})
export class ImageService{

  imagesInsertList: ImageTranser []=[];
  url=environment.Url;

constructor(private http: HttpClient) {}


public get(productId:number):Observable<ProductImageModel[]>{
  return this.http.get<ProductImageModel[]>(`${this.url}images/${productId}`);
}

public verifyFileOnServer(imageName:string, productIdToModel):Observable<any>{
  var data:ProductImageModel=new ProductImageModel();
  data.Name=imageName.toString();
  data.ProductId=productIdToModel;
  return this.http.post<ProductImageModel>(`${this.url}images`, data);
}

public delete(image:ProductImageModel []): Observable<any> {
  return this.http.post<any>(`${this.url}images/delete`, image);
}
  
public insert(formData:any, productId: number): Observable<any> {
  return this.http.put<any>(`${this.url}insert_Image/${productId}`, formData);
}
  

// public deleteImageServer(images:any []) :Observable<any>{
//   return  this.http.post(`${this.url}images/server}`, images);
// }

  //observables encadenados
  
  // deleteImages(list:any[]) {
  //   return this.http.get('/api/books/' + id).pipe(
  //     switchMap((book: any) => this.http.get('/api/authors/' + book.author_id).pipe(
  //       map((author: any) => {
  //         book.author = author;
  //         return book;
  //       })
  //     ))
  //   );
  // }

  
}






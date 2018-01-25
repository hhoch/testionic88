import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { WebWorkerService } from 'angular2-web-worker';

import { Result } from './result';

@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
  providers: [WebWorkerService]
})
export class ContentPage implements OnInit {
  public webWorkerResults: any[] = [];
  public webWorkerStart = 35;
  public webWorkerEnd = 45;
  public synchronousStart = 35;
  public synchronousEnd = 38;
  public synchronousResults: any[] = [];
  public synchronousDuration = 0;
  private promises: Promise<any>[] = [];

  constructor(
    public navCtrl: NavController,
    private webWorkerService: WebWorkerService
  ) {}

  startWebWorkerCalculation() {
    let pointer = this.webWorkerStart;
    const end = this.webWorkerEnd;

    this.stopWebWorkerCalculation();
    while (pointer <= end) {
      this.webWorkerCalculate(pointer);
      pointer++;
    }
  }

  stopWebWorkerCalculation() {
    this.promises.forEach(promise => {
      this.webWorkerService.terminate(promise);
    });
    this.promises.length = 0;
    this.webWorkerResults.length = 0;
  }

  startSynchronousCalculation() {
    let pointer = this.synchronousStart;
    const end = this.synchronousEnd;

    this.synchronousResults.length = 0;

    const start = new Date();
    while (pointer <= end) {
      const result = new Result(pointer, this.fib(pointer), false);
      this.synchronousResults.push(result);
      pointer++;
    }
    this.synchronousDuration = (new Date().getTime() - start.getTime()) / 1000;
  }

  startExternalRequest() {
    const promises = [];
    promises.push(this.webWorkerService.runUrl('dist/echo.js', 'marco'));
    promises.push(this.webWorkerService.run(() => 'polo', 0));

    promises.forEach(promise => {
      let worker = this.webWorkerService.getWorker(promise);
      worker.addEventListener('message', event => {
        console.log('getWorker', event.data);
      });
    });

    Promise.all(promises)
      .then(response => console.log(response))
      .catch(error => console.error(error));
  }

  ngOnInit() {
    this.startExternalRequest();
  }

  private webWorkerCalculate(n: number) {
    const promise = this.webWorkerService.run(this.fib, n);
    const result = new Result(n, 0, true);
    this.webWorkerResults.push(result);
    this.promises.push(promise);

    promise.then(function(response) {
      result.result = response;
      result.loading = false;
    });
  }

  private fib(n: number) {
    const fib = (n: number): number => {
      if (n < 2) return 1;
      return fib(n - 1) + fib(n - 2);
    };

    return fib(n);
  }
}

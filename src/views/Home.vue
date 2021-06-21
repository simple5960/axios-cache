<template>
  <div class="home">
    <p>{{test}}</p>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import axios from 'axios'
@Options({
  components: {
  },
  created()
  {
    this.getData();
  }
})
export default class Home extends Vue {
  private test:any;
 
  private getData()
  {
    axios({
      method:"get",
      url:"https://mock.corp.kuaishou.com/mock/7566/apitest/getUserName"
    })
    .then(res=>{
      this.test=res
    })
  }
}
</script>

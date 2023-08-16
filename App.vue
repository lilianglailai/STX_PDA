<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
@import  "@/static/ll_css.scss";
	/*每个页面公共css */
.router-box{
    padding-top: calc(var(--status-bar-height) + 131.6rpx)
}
body{
    background: #F2F2F2;
}
</style>

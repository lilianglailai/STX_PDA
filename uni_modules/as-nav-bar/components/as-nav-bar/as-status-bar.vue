<template>
	<view :style="{ height: statusBarHeight }" class="as-status-bar">
		<slot />
	</view>
</template>

<script>
	export default {
		name: 'AsStatusBar',
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight + 'px'
			}
		}
	}
</script>

<style lang="scss" >
	.as-status-bar {
		// width: 750rpx;
		height: 20px;
		// height: var(--status-bar-height);
	}
</style>

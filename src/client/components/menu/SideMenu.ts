import { Vue, Component,Provide } from 'vue-property-decorator';

@Component({
	template: `
	<!-- sidebar menu -->
	<div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
		<div class="menu_section">
			<h3>General</h3>
			<ul class="nav side-menu">
				<li><a><i class="fa fa-home"></i> Home <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><router-link to="/">Dashboard</router-link></li>
						<li><router-link to="/dashboard-2">Dashboard2</router-link></li>
						<li><a href="index3.html">Dashboard3</a></li>
					</ul>
				</li>
				<li><a><i class="fa fa-edit"></i> Forms <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><a href="form.html">General Form</a></li>
						<li><a href="form_advanced.html">Advanced Components</a></li>
						<li><a href="form_validation.html">Form Validation</a></li>
						<li><a href="form_wizards.html">Form Wizard</a></li>
						<li><a href="form_upload.html">Form Upload</a></li>
						<li><a href="form_buttons.html">Form Buttons</a></li>
					</ul>
				</li>
			</ul>
		</div>
		<!-- /sidebar menu -->
	</div>`
})
export default class SideMenu extends Vue {
	mounted () {
		var
		CURRENT_URL = window.location.href.split('#')[0].split('?')[0],
		$BODY = $('body'),
		$SIDEBAR_MENU = $('#sidebar-menu'),
		$SIDEBAR_FOOTER = $('.sidebar-footer'),
		$LEFT_COL = $('.left_col'),
		$RIGHT_COL = $('.right_col'),
		$NAV_MENU = $('.nav_menu'),
		$FOOTER = $('footer');

		// TODO: This is some kind of easy fix, maybe we can improve this
		function setContentHeight () {
			// reset height
			$RIGHT_COL.css('min-height', $(window).height());

			var bodyHeight = $BODY.outerHeight(),
			footerHeight = $BODY.hasClass('footer_fixed') ? -10 : $FOOTER.height(),
			leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
			contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

			// normalize content
			contentHeight -= $NAV_MENU.height() + footerHeight;

			$RIGHT_COL.css('min-height', contentHeight);
		};

		$SIDEBAR_MENU.find('a').on('click', function(ev) {
				var $li = $(this).parent();

			if ($li.is('.active')) {
				$li.removeClass('active active-sm');
				$('ul:first', $li).slideUp({
					complete : setContentHeight
				});
			} else {
				// prevent closing menu if we are on child menu
				if (!$li.parent().is('.child_menu')) {
					$SIDEBAR_MENU.find('li').removeClass('active active-sm');
					$SIDEBAR_MENU.find('li ul').slideUp();
				}

				$li.addClass('active');
				$('ul:first', $li).slideDown({
					complete : setContentHeight
				});
			}
		});

		// toggle small or large menu
		this.$root.$on('navigation:menuToggle',function() {
			if ($BODY.hasClass('nav-md')) {
				$SIDEBAR_MENU.find('li.active ul').hide();
				$SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
			} else {
				$SIDEBAR_MENU.find('li.active-sm ul').show();
				$SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
			}

			$BODY.toggleClass('nav-md nav-sm');

			setContentHeight();

			/*
			$('.dataTable').each ( function () {
				$(this).dataTable().fnDraw();
			});
			*/
		});

		// check active menu
		$SIDEBAR_MENU.find('a[href="' + CURRENT_URL + '"]').parent('li').addClass('current-page');

		$SIDEBAR_MENU.find('a').filter(function () {
			return (<HTMLAnchorElement>this).href == CURRENT_URL;
		}).parent('li').addClass('current-page').parents('ul').slideDown({
			complete : setContentHeight
		}).parent().addClass('active');

		// recompute content when resizing
		/*$(window).smartresize({
			complete : setContentHeight
		});*/

		setContentHeight();

		// fixed sidebar
		/*if ($.fn.mCustomScrollbar) {
			$('.menu_fixed').mCustomScrollbar({
				autoHideScrollbar: true,
				theme: 'minimal',
				mouseWheel:{ preventDefault: true }
			});
		}*/

	}
}

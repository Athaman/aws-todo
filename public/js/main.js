$(document).ready(() => {
  $('.delete-todo').on('click', (e) => {
    const $target = $(e.target);
    const title = $target.attr('data-title');
    $.ajax({
      type: 'DELETE',
      url: '/todo/delete/'+title,
      success: (response) => {
        console.log('Deleting Todo: ' + title);
        console.log('SHOULD BE REDIRECTING NOW')
        window.location.href = '/';
      },
      error: (error) => {
        console.error(error);
      }
    });
  });
});

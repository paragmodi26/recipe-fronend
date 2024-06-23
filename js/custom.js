// nice select
$(document).ready(function() {
    $('select').niceSelect();

    // password shor hide
    $('#togglePassword').click(function() {
        const passwordInput = $('#password');
        const type = passwordInput.attr('type') === 'password' ? 'text' : 'password';
        passwordInput.attr('type', type);

        // Toggle the eye icon
        $(this).text($(this).text() === '👁️' ? '🙈' : '👁️');
    });

    //signup call
    $('#signupForm').on('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Collect form data
        var formData = {
          name: $('input[name="name"]').val(),
          email: $('input[name="email"]').val(),
          mobile_no: $('input[name="mobile"]').val(),
          password: $('input[name="password"]').val()
        };

        // Make the AJAX request
        $.ajax({
          url: 'http://127.0.0.1:8080/rich/api/v1/user/save',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(formData),
          success: function(response) {
            console.log(response);
            console.log(response.message);
            if (response.status == "success"){
                $('#errorModalLabel').text('Success');
                $('#errorModalBody').text(response.message).removeClass('error').addClass('success');
                $('#errorModal').modal('show');
                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 1000); // Redirect to login page after 2 seconds
            }
            else{
                $('#errorModalLabel').text('Error');
                $('#errorModalBody').text(response.message).removeClass('success').addClass('error');
                $('#errorModal').modal('show');
                setTimeout(function() {
                    $('#errorModal').modal('hide');
                }, 2000);
            }
            
          },
          error: function(xhr, status, error) {
            $('#errorModalLabel').text('Error');
            $('#errorModalBody').text(xhr.responseText).removeClass('success').addClass('error');
            $('#errorModal').modal('show');
            setTimeout(function() {
                $('#errorModal').modal('hide');
            }, 2000);
          }
        });
      });

    //login call
    $('#LoginForm').on('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Collect form data
        var formData = {
          email: $('input[name="email"]').val(),
          password: $('input[name="password"]').val()
        };

        // Make the AJAX request
        $.ajax({
          url: 'http://127.0.0.1:8080/rich/api/v1/user/login',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(formData),
          success: function(response) {
            console.log(response);
            console.log(response.data.access_token);
            if (response.status == "success"){
                $('#errorModalLabel').text('Success');
                $('#errorModalBody').text(response.message).removeClass('error').addClass('success');
                $('#errorModal').modal('show');
                sessionStorage.setItem('authToken', response.data.access_token);
                setTimeout(function() {
                    window.location.href = 'home.html';
                }, 1000); // Redirect to login page after 2 seconds
            }
            else{
                $('#errorModalLabel').text('Error');
                $('#errorModalBody').text(response.message).removeClass('success').addClass('error');
                $('#errorModal').modal('show');
                setTimeout(function() {
                    $('#errorModal').modal('hide');
                }, 2000);
            }
            
          },
          error: function(xhr, status, error) {
            $('#errorModalLabel').text('Error');
            $('#errorModalBody').text(xhr.responseText).removeClass('success').addClass('error');
            $('#errorModal').modal('show');
            setTimeout(function() {
                $('#errorModal').modal('hide');
            }, 2000);
          }
        });
      });

    // logout call
      $('#logout').on('click', function() {
        // Get the token from sessionStorage
        var token = sessionStorage.getItem('authToken');
        console.log(token)
        // Make the AJAX request to the logout API
        $.ajax({
            url: 'http://127.0.0.1:8080/rich/api/v1/user/logout',
            type: 'GET',
            contentType: 'application/json',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                if (response.status == "success") {
                    sessionStorage.removeItem('authToken');
                    setTimeout(function() {
                        window.location.href = 'login.html';
                        window.location.replace('login.html');  
                        history.pushState(null, null, 'login.html');
                    }, 1000);
                }else{
                    sessionStorage.removeItem('authToken');
                    setTimeout(function() {
                        window.location.href = 'login.html';
                        window.location.replace('login.html');  
                        history.pushState(null, null, 'login.html');
                    }, 1000);
                }
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    });

    $('.update-column, .delete-column').css('display', 'none');
    $('#only_me').change(function() {
        if ($(this).is(':checked')) {
          $('.update-column, .delete-column').css('display', 'table-cell');
        } else {
          $('.update-column, .delete-column').css('display', 'none');
        }
      });
    
    // recipe list
    function fetchData(page=1, searchKeyword = '', isOnlyMe = false) {
        var is_all = !isOnlyMe; // Convert isOnlyMe to is_all
        
        var url = `http://127.0.0.1:8080/rich/api/v1/recipe/all?page=${page}&limit=5&is_all=${is_all}`;
        
        // Customize URL based on checkbox state and search keyword
        if (searchKeyword.trim() !== '') {
          url += `&search_keyword=${searchKeyword}`;
        }
        
        var token = sessionStorage.getItem('authToken'); 
        
        // Fetch data from API
        $.ajax({
          url: url,
          headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          method: 'GET',
          success: function(response) {
            if (response.status === 'success') {
              // Clear existing table rows
              $('#recipeTableBody').empty();
              
              // Populate table with fetched data
              response.data.forEach(function(recipe) {
                var ingredients = recipe.ingredients.map(function(ingredient) {
                  return `${ingredient.name} (${ingredient.quantity})`;
                }).join('<br>');
                
                var tableRow = `<tr>
                  <td>${recipe.id}</td>
                  <td>${recipe.name}</td>
                  <td>${recipe.title}</td>
                  <td>${recipe.description}</td>
                  <td>${ingredients}</td>
                  <td>${recipe.instructions}</td>
                  <td>${recipe.created_by.name}</td>`;
                
                // Check if 'Only me' checkbox is checked
                if (isOnlyMe) {
                    // Add update and delete buttons with data-attributes
                    tableRow += `<td><a href="update_recipe.html?id=${recipe.id}" class="btn btn-warning update-btn" data-recipe-id="${recipe.id}">Update</a></td>
                    <td><a href="#" class="btn btn-secondary delete-btn" data-recipe-id="${recipe.id}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></a></td>`;

                  } else {
                    // Otherwise, show empty cells
                    tableRow += `<td></td><td></td>`;
                  }
                
                tableRow += `</tr>`;
                
                $('#recipeTableBody').append(tableRow);
              });
              
              // Pagination
              renderPagination(response.page, searchKeyword, isOnlyMe);
            } else {
              console.error('Failed to fetch data');
            }
          },
          error: function(err) {
            console.error('Error fetching data:', err);
          }
        });
      }
      
      // Initial fetch on page load
      fetchData();
      
      // Handle form submission (search button)
      $('#search-form').submit(function(event) {
        event.preventDefault();
        var searchKeyword = $('#search-form input[name="search"]').val();
        var isOnlyMe = $('#only_me').prop('checked');
        fetchData(1,searchKeyword, isOnlyMe);
      });
      
      // Function to render pagination links
      function renderPagination(pageData, searchKeyword, isOnlyMe) {
        var paginationHtml = '';
        for (var i = 1; i <= pageData.num_pages; i++) {
          paginationHtml += `<li class="page-item ${i === pageData.page_number ? 'active' : ''}"><a class="page-link" href="#" onclick="fetchData(${i}, '${searchKeyword}', ${isOnlyMe})">${i}</a></li>`;
        }
        $('#pagination').html(paginationHtml);
      }
      
      // Event delegation for pagination links
      $('#pagination').on('click', '.page-link', function(event) {
        event.preventDefault();
        var page = $(this).text(); // Use .text() to get the page number from link text
        var searchKeyword = $('#search-form input[name="search"]').val();
        var isOnlyMe = $('#only_me').prop('checked');
        fetchData(page, searchKeyword, isOnlyMe); // Call fetchData with page number
      });

      //delete recipe
      $('#recipeTableBody').on('click', '.delete-btn', function(event) {
        event.preventDefault();
        var recipeId = $(this).data('recipe-id');
        var token = sessionStorage.getItem('authToken');
        
        // Confirm deletion
        if (confirm('Are you sure you want to delete this recipe?')) {
          // Send DELETE request to API
          $.ajax({
            url: `http://127.0.0.1:8080/rich/api/v1/recipe/${recipeId}`,
            headers: {
              'accept': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            method: 'DELETE',
            success: function(response) {
              if (response.status === 'success') {
                // Optionally, you can re-fetch data or remove the row from the table
                fetchData();
              } else {
                    if (response.message == "Authentication Token Missing!" || response.message == "Token is expired please login again" || response.message == "Invalid Token, Please Login again"){
                        sessionStorage.removeItem('authToken');
                        setTimeout(function() {
                            window.location.href = 'login.html';
                            window.location.replace('login.html');  
                            history.pushState(null, null, 'login.html');
                        }, 1000);
                    }
                    else{
                        fetchData();
                    }
                }
            },
            error: function(err) {
              console.error('Error deleting recipe:', err);
              sessionStorage.removeItem('authToken');
                setTimeout(function() {
                    window.location.href = 'login.html';
                    window.location.replace('login.html');  
                    history.pushState(null, null, 'login.html');
                }, 1000);
            }
          });
        }
      });

     //updste button click
     $('#recipeTableBody').on('click', '.update-btn', function(e) {
        e.preventDefault();
        var recipeId = $(this).data('recipe-id');
        console.log("recipeId", recipeId)
        fetchAndPopulateRecipe(recipeId); // Call function to fetch recipe details by ID
    });
    
    // Add ingredient button click handler
    $('#addIngredientUpdatepage').click(function () {
        addIngredientFieldforUpdate('', ''); // Initially add an empty ingredient field
    });

    const recipeData = JSON.parse(sessionStorage.getItem('recipeData'));

    if (recipeData) {
        // Populate form fields with fetched data
        populateFormFields(recipeData);
    } else {
        console.error('No recipe data found in sessionStorage');
        // Handle scenario where no data is found
    }

      // update recipe
      $('#updateRecipe').click(function() {
        // Implement your update logic here
        updateRecipe();
    });
    // end first brcaket  
  });


function addIngredientField() {
    // Get the container for ingredients
    const container = document.getElementById('ingredients-container');

    // Create a new div for the ingredient and quantity fields
    const newField = document.createElement('div');
    newField.className = 'ingredient-field form-row mb-2';

    // Create the ingredient input
    const ingredientInput = document.createElement('input');
    ingredientInput.type = 'text';
    ingredientInput.name = 'ingredients[]';
    ingredientInput.className = 'form-control col-md-5 mr-2';
    ingredientInput.placeholder = 'Ingredient';
    ingredientInput.pattern = '[A-Za-z\\s]{2,100}';
    ingredientInput.title = 'Minimum 2 and maximum 100 alphabets are allowed';
    ingredientInput.required = true;

    // Create the quantity input
    const quantityInput = document.createElement('input');
    quantityInput.type = 'text';
    quantityInput.name = 'quantities[]';
    quantityInput.className = 'form-control col-md-5 mr-2';
    quantityInput.placeholder = 'Quantity';
    quantityInput.required = true;

    // Create the delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger delete-ingredients';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function () {
        container.removeChild(newField);
    };

    // Append the inputs and delete button to the new div
    newField.appendChild(ingredientInput);
    newField.appendChild(quantityInput);
    newField.appendChild(deleteButton);

    // Append the new div to the container
    container.appendChild(newField);
}


function saveRecipe() {
    // Collect data from the form
    const name = $('input[name="name"]').val();
    const title = $('input[name="title"]').val();
    const description = $('textarea[name="description"]').val();
    const instructions = $('textarea[name="instruction"]').val();

    const ingredients = [];
    $('.ingredient-field').each(function() {
        const ingredientName = $(this).find('input[name="ingredients[]"]').val();
        const quantity = $(this).find('input[name="quantities[]"]').val();
        ingredients.push({ name: ingredientName, quantity: quantity });
    });

    // Prepare the data object
    const recipeData = {
        name: name,
        title: title,
        description: description,
        ingredients: ingredients,
        instructions: instructions
    };

    // Fetch the auth token from session storage
    const authToken = sessionStorage.getItem('authToken');

    // AJAX call to the API
    $.ajax({
        url: 'http://127.0.0.1:8080/rich/api/v1/recipe/save',
        type: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        data: JSON.stringify(recipeData),
        success: function(response) {
            console.log('Recipe saved successfully:', response);
            if (response.status == "success"){
                $('#errorModalLabel').text('Success');
                $('#errorModalBody').text(response.message).removeClass('error').addClass('success');
                $('#errorModal').modal('show');
                setTimeout(function() {
                    $('#errorModal').modal('hide');
                    $('#recipeForm')[0].reset(); // Reset the form
                    $('#ingredients-container').empty();
                }, 2000); // Redirect to login page after 2 seconds
            }
            else{
                $('#errorModalLabel').text('Error');
                $('#errorModalBody').text(response.message).removeClass('success').addClass('error');
                $('#errorModal').modal('show');
                if (response.message == "Authentication Token Missing!" || response.message == "Token is expired please login again" || response.message == "Invalid Token, Please Login again"){
                    sessionStorage.removeItem('authToken');
                    setTimeout(function() {
                        window.location.href = 'login.html';
                        window.location.replace('login.html');  
                        history.pushState(null, null, 'login.html');
                    }, 1000);
                }
                else{
                    setTimeout(function() {
                        $('#errorModal').modal('hide');
                    }, 2000);
                }
            }
            // Handle success response here (e.g., show a success message)
        },
        error: function(xhr, status, error) {
            $('#errorModalLabel').text('Error');
            $('#errorModalBody').text(xhr.responseText).removeClass('success').addClass('error');
            $('#errorModal').modal('show');
            setTimeout(function() {
                $('#errorModal').modal('hide');
            }, 2000);
            // Handle error response here (e.g., show an error message)
        }
    });
}



function fetchAndPopulateRecipe(recipeId) {
    // Replace this URL with your actual API endpoint to fetch recipe data
    const authToken = sessionStorage.getItem('authToken');

    // AJAX call to fetch recipe data
    $.ajax({
        url: 'http://127.0.0.1:8080/rich/api/v1/recipe/' + recipeId,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        method: 'GET',
        success: function(response) {
            if (response.status === 'success') {
                // Populate form fields with fetched data
                sessionStorage.setItem('recipeData', JSON.stringify(response.data));
                window.location.href = "update_recipe.html";
            } else {
                $('#errorModalLabel').text('Error');
                $('#errorModalBody').text(response.message).removeClass('success').addClass('error');
                $('#errorModal').modal('show');
                if (response.message == "Authentication Token Missing!" || response.message == "Token is expired please login again" || response.message == "Invalid Token, Please Login again"){
                    sessionStorage.removeItem('authToken');
                    setTimeout(function() {
                        window.location.href = 'login.html';
                        window.location.replace('login.html');  
                        history.pushState(null, null, 'login.html');
                    }, 1000);
                }
                else{
                    setTimeout(function() {
                        $('#errorModal').modal('hide');
                    }, 2000);
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data:', error);
            sessionStorage.removeItem('authToken');
            setTimeout(function() {
                window.location.href = 'login.html';
                window.location.replace('login.html');  
                history.pushState(null, null, 'login.html');
            }, 1000);
            // Handle error scenario
        }
    });
}

function populateFormFields(recipeData) {
    $('#recipeId').val(recipeData.id); // Assuming you have a hidden input for recipe ID
    $('#name').val(recipeData.name);
    $('#title').val(recipeData.title);
    $('#description').val(recipeData.description);
    $('#instruction').val(recipeData.instructions);

    // Clear existing ingredient fields
    $('#ingredients-container').empty();

    // Populate ingredients dynamically
    recipeData.ingredients.forEach(function(ingredient) {
        addIngredientFieldforUpdate(ingredient.name, ingredient.quantity);
    });
}


function updateRecipe() {
    // Collect updated data from the form
    const recipeId = $('#recipeId').val();
    const name = $('#name').val();
    const title = $('#title').val();
    const description = $('#description').val();
    const instruction = $('#instruction').val();

    // Example of how to collect ingredients (if you need to update them)
    const ingredients = [];
    $('.form-row').each(function() {
        const ingredientName = $(this).find('.form-control:eq(0)').val();
        const quantity = $(this).find('.form-control:eq(1)').val();
        ingredients.push({ name: ingredientName, quantity: quantity });
    });

    // Prepare the updated data object
    const updatedRecipeData = {
        id: recipeId,
        name: name,
        title: title,
        description: description,
        instructions: instruction,
        ingredients: ingredients
    };

    const authToken = sessionStorage.getItem('authToken');

    // AJAX call to update recipe
    $.ajax({
        url: 'http://127.0.0.1:8080/rich/api/v1/recipe/' + recipeId,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        method: 'PATCH',
        data: JSON.stringify(updatedRecipeData),
        success: function(response) {
            if (response.status == "success"){
                $('#errorModalLabel').text('Success');
                $('#errorModalBody').text(response.message).removeClass('error').addClass('success');
                $('#errorModal').modal('show');
                setTimeout(function() {
                    $('#errorModal').modal('hide');
                    $('#recipeForm')[0].reset(); // Reset the form
                    $('#ingredients-container').empty();
                }, 2000); // Redirect to login page after 2 seconds
            }
            else{
                $('#errorModalLabel').text('Error');
                $('#errorModalBody').text(response.message).removeClass('success').addClass('error');
                $('#errorModal').modal('show');
                if (response.message == "Authentication Token Missing!" || response.message == "Token is expired please login again" || response.message == "Invalid Token, Please Login again"){
                    sessionStorage.removeItem('authToken');
                    setTimeout(function() {
                        window.location.href = 'login.html';
                        window.location.replace('login.html');  
                        history.pushState(null, null, 'login.html');
                    }, 1000);
                }
                else{
                    setTimeout(function() {
                        $('#errorModal').modal('hide');
                    }, 2000);
                }
            }
        },
        error: function(xhr, status, error) {
            sessionStorage.removeItem('authToken');
            setTimeout(function() {
                window.location.href = 'login.html';
                window.location.replace('login.html');  
                history.pushState(null, null, 'login.html');
            }, 1000);
            // Handle error scenario
        }
    });
}


function addIngredientFieldforUpdate(ingredientName, quantity) {
    // Create a new div for the ingredient and quantity fields
    const newField = document.createElement('div');
    newField.className = 'form-row mb-2';

    // Create the ingredient input
    const ingredientInput = document.createElement('input');
    ingredientInput.type = 'text';
    ingredientInput.className = 'form-control col-md-5 mr-2';
    ingredientInput.placeholder = 'Ingredient';
    ingredientInput.value = ingredientName; // Populate with ingredient name
    

    // Create the quantity input
    const quantityInput = document.createElement('input');
    quantityInput.type = 'text';
    quantityInput.className = 'form-control col-md-5 mr-2';
    quantityInput.placeholder = 'Quantity';
    quantityInput.value = quantity; // Populate with quantity

    // Create a delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger ml-2';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function() {
        newField.remove(); // Remove the entire ingredient field when delete button is clicked
    };

    // Append the inputs and delete button to the new div
    newField.appendChild(ingredientInput);
    newField.appendChild(quantityInput);
    newField.appendChild(deleteButton);

    // Append the new div to the ingredients container
    document.getElementById('ingredients-container').appendChild(newField);
}

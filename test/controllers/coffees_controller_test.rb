require "test_helper"

class CoffeesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @coffee = coffees(:one)
  end

  test "should get index" do
    get coffees_url
    assert_response :success
  end

  test "should get new" do
    get new_coffee_url
    assert_response :success
  end

  test "should create coffee" do
    assert_difference("Coffee.count") do
      post coffees_url, params: { coffee: { amount: @coffee.amount, author_id: @coffee.author_id, message: @coffee.message, name: @coffee.name, sender_wallet_address: @coffee.sender_wallet_address, timestamp: @coffee.timestamp, tx_hash: @coffee.tx_hash } }
    end

    assert_redirected_to coffee_url(Coffee.last)
  end

  test "should show coffee" do
    get coffee_url(@coffee)
    assert_response :success
  end

  test "should get edit" do
    get edit_coffee_url(@coffee)
    assert_response :success
  end

  test "should update coffee" do
    patch coffee_url(@coffee), params: { coffee: { amount: @coffee.amount, author_id: @coffee.author_id, message: @coffee.message, name: @coffee.name, sender_wallet_address: @coffee.sender_wallet_address, timestamp: @coffee.timestamp, tx_hash: @coffee.tx_hash } }
    assert_redirected_to coffee_url(@coffee)
  end

  test "should destroy coffee" do
    assert_difference("Coffee.count", -1) do
      delete coffee_url(@coffee)
    end

    assert_redirected_to coffees_url
  end
end

/*
 * Ammon Allen
 * COSC 2336
 * Dr. Jane Liu
 * Programming Assignment 5
 * Due: 10/09/2024
 * This program takes two strings from the user and checks if the second string given is found in the first string.
 */

import java.util.Scanner;

public class PatternMatching {

	public static void main(String[] args) {
		Scanner input = new Scanner(System.in);

		for (int i = 0; i < 2; i++) 
		{
			System.out.print("Enter a string: ");
			String string1 = input.nextLine();

			System.out.print("Enter the second string: ");
			String string2 = input.nextLine();

			System.out.println(s1ContainsS2(string1, string2));

		}
	}

	// Method to check if s2 is a substring of s1
	public static boolean s1ContainsS2(String s1, String s2) 
	{
		boolean matchFound = false; // Flag to indicate if a match is found
		int length1 = s1.length(); // Length of the first string
		int length2 = s2.length(); // Length of the second string

		if (length2 > length1)
			return matchFound; // No match possible if s2 is longer than s1

		// Iterate through s1 to check for substring matches
		for (int i = 0; i <= length1 - length2; i++) 
		{
			int j; // Index for s2
			// Compare the current substring of s1 with s2
			for (j = 0; j < length2; j++) 
			{
				if (s1.charAt(i + j) != s2.charAt(j)) 
				{
					break; // Exit the inner loop on mismatch
				}
			}
			// If j equals length2, a full match was found
			if (j == length2) 
			{
				matchFound = true; // Set flag to true if a match is found
				break; // Exit the outer loop as we found a match
			}
		}

		return matchFound; // Return the result of the match check
	}
}
